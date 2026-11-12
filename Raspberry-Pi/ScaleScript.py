import time
import sys
import statistics
import RPi.GPIO as GPIO
from hx711 import HX711
from RPLCD.i2c import CharLCD
import requests

# --- HX711 Configuration ---
DAT_PIN = 5
CLK_PIN = 6
REFERENCE_UNIT = 240.3867
ZERO_OFFSET = 289979.45

# --- I2C LCD Configuration ---
LCD_ADDRESS = 0x27  # Change to 0x3f if i2cdetect shows 3f
LCD_COLS = 16
LCD_ROWS = 2

# --- Backend Server & Operational Configuration ---
# Set this to your computer's local network IP where the Node.js backend runs on port 5005
SERVER_URL = "http://192.168.1.100:5005/api/scale/log-weight"
DISTRICT = "guntur"          # amaravati | guntur | vijayawada
ITEM_NAME = "General Waste"   # Optional dish name; backend will match open daily log if active
TARE_WEIGHT_KG = 0.0          # Container tare deducted (e.g., 1.20 for Gastronorm Pan)

# --- Option B: Auto-Stabilization Parameters ---
MIN_TRIGGER_WEIGHT_G = 50.0     # Minimum weight in grams to detect food is placed
STABILITY_TOLERANCE_G = 15.0    # Maximum variation (+/- grams) to consider scale stable
STABLE_SAMPLES_NEEDED = 8       # Consecutive stable readings (~1.6 - 2.0 seconds)
RESET_THRESHOLD_G = 25.0        # Weight must drop below this to reset and await next item

GPIO.setwarnings(False)
hx = HX711(dout_pin=DAT_PIN, pd_sck_pin=CLK_PIN)
hx.reset()

# Initialize the 16x2 I2C LCD
lcd = CharLCD(i2c_expander='PCF8574', address=LCD_ADDRESS, port=1,
              cols=LCD_COLS, rows=LCD_ROWS, dotsize=8)

def read_raw_mean(samples=5):
    raw_list = hx.get_raw_data(samples)
    valid = [x for x in raw_list if isinstance(x, (int, float))]
    if not valid:
        raise RuntimeError("No valid data received from HX711. Check DAT/CLK wiring.")
    return statistics.mean(valid)

def send_waste_log(gross_kg, tare_kg):
    """Sends the settled weight reading to the Node.js backend."""
    payload = {
        "district": DISTRICT,
        "itemName": ITEM_NAME,
        "grossWeightKg": round(gross_kg, 2),
        "tareWeightKg": round(tare_kg, 2)
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(SERVER_URL, json=payload, headers=headers, timeout=4)
        if response.status_code == 200 or response.status_code == 201:
            res_data = response.json()
            return True, res_data.get("data", {})
        else:
            return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, str(e)

# Startup message on LCD
lcd.clear()
lcd.cursor_pos = (0, 0)
lcd.write_string("Smart Scale 1.0 ")
lcd.cursor_pos = (1, 0)
lcd.write_string("Auto-Log Active ")
time.sleep(2.0)
lcd.clear()

print(f"Ready! (Zero offset: {ZERO_OFFSET:.2f}) Auto-stabilization logging active.")
print(f"Target Server: {SERVER_URL} | District: {DISTRICT}")

# State tracking variables for auto-stabilization
recent_samples = []
has_logged_current_item = False

try:
    while True:
        raw_reading = read_raw_mean(5)
        weight_g = (raw_reading - ZERO_OFFSET) / REFERENCE_UNIT

        # Filter out baseline noise near zero
        if -0.5 < weight_g < 0.5:
            weight_g = 0.0

        weight_kg = weight_g / 1000.0

        # Print to terminal
        status_text = "LOGGED" if has_logged_current_item else "ACTIVE"
        print(f"Weight: {weight_g:7.1f} g  |  ({weight_kg:5.2f} kg) [{status_text}]  ", end="\r")

        # --- AUTO-STABILIZATION STATE MACHINE ---
        if not has_logged_current_item:
            if weight_g >= MIN_TRIGGER_WEIGHT_G:
                recent_samples.append(weight_g)
                if len(recent_samples) > STABLE_SAMPLES_NEEDED:
                    recent_samples.pop(0)

                # Check if weight has settled within the tolerance band
                if len(recent_samples) == STABLE_SAMPLES_NEEDED:
                    weight_range = max(recent_samples) - min(recent_samples)
                    if weight_range <= STABILITY_TOLERANCE_G:
                        stable_weight_g = statistics.mean(recent_samples)
                        stable_weight_kg = stable_weight_g / 1000.0

                        # Display locking state
                        lcd.cursor_pos = (0, 0)
                        lcd.write_string("Settled! Logging")
                        lcd.cursor_pos = (1, 0)
                        lcd.write_string(f"Net: {stable_weight_kg:5.2f} kg   ")

                        print(f"\n[Auto-Log] Weight settled at {stable_weight_g:.1f}g ({stable_weight_kg:.2f}kg). Sending to backend...")
                        success, detail = send_waste_log(stable_weight_kg, TARE_WEIGHT_KG)

                        time.sleep(0.5)
                        lcd.clear()
                        if success:
                            portions = detail.get("portionsEquivalent", "")
                            lcd.cursor_pos = (0, 0)
                            lcd.write_string("LOG SUCCESSFUL! ")
                            lcd.cursor_pos = (1, 0)
                            lcd.write_string(f"Saved {portions} portions"[:16])
                            print(f"[Auto-Log Success] Logged to backend: {detail}")
                        else:
                            lcd.cursor_pos = (0, 0)
                            lcd.write_string("NET SYNC ERR!   ")
                            lcd.cursor_pos = (1, 0)
                            lcd.write_string("Server Offline  ")
                            print(f"[Auto-Log Error] Failed to reach server: {detail}")

                        time.sleep(2.0)
                        has_logged_current_item = True
                        recent_samples.clear()
                        continue
                    else:
                        # Weight still shifting (pouring or moving food)
                        lcd.cursor_pos = (0, 0)
                        lcd.write_string(f"Wt: {weight_g:7.1f} g   ")
                        lcd.cursor_pos = (1, 0)
                        lcd.write_string("Settling...     ")
                else:
                    lcd.cursor_pos = (0, 0)
                    lcd.write_string(f"Wt: {weight_g:7.1f} g   ")
                    lcd.cursor_pos = (1, 0)
                    lcd.write_string("Detecting Load..")
            else:
                # Scale is empty / idle
                recent_samples.clear()
                lcd.cursor_pos = (0, 0)
                lcd.write_string(f"Wt: {weight_g:7.1f} g   ")
                lcd.cursor_pos = (1, 0)
                lcd.write_string(f"Ready ({DISTRICT[:5]})   ")
        else:
            # Item has been logged; prompt operator to remove container
            if weight_g <= RESET_THRESHOLD_G:
                # Container removed, re-arm scale for next reading
                has_logged_current_item = False
                recent_samples.clear()
                lcd.clear()
                lcd.cursor_pos = (0, 0)
                lcd.write_string("Scale Reset!    ")
                lcd.cursor_pos = (1, 0)
                lcd.write_string("Ready for next  ")
                time.sleep(1.0)
                lcd.clear()
            else:
                lcd.cursor_pos = (0, 0)
                lcd.write_string(f"Done: {weight_kg:5.2f} kg  ")
                lcd.cursor_pos = (1, 0)
                lcd.write_string("Remove Container")

        time.sleep(0.2)

except (KeyboardInterrupt, SystemExit):
    print("\nStopping scale...")
    lcd.clear()
    lcd.write_string("Scale Stopped   ")
    time.sleep(1)
    lcd.clear()
finally:
    GPIO.cleanup()
