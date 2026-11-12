import time
import sys
import statistics
import RPi.GPIO as GPIO
from hx711 import HX711
from RPLCD.i2c import CharLCD

# --- HX711 Configuration ---
DAT_PIN = 5
CLK_PIN = 6
REFERENCE_UNIT = 240.3867
ZERO_OFFSET = 289979.45

# --- I2C LCD Configuration ---
LCD_ADDRESS = 0x27  # Change to 0x3f if i2cdetect shows 3f
LCD_COLS = 16
LCD_ROWS = 2

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

# Startup message on LCD
lcd.clear()
lcd.write_string("Scale Ready!")
time.sleep(1.5)
lcd.clear()

print(f"Ready! (Zero offset: {ZERO_OFFSET:.2f}) Reading weight...")

try:
    while True:
        raw_reading = read_raw_mean(5)
        weight_g = (raw_reading - ZERO_OFFSET) / REFERENCE_UNIT

        # Filter out baseline noise near zero
        if -0.5 < weight_g < 0.5:
            weight_g = 0.0

        weight_kg = weight_g / 1000.0

        # Print to PuTTY terminal
        print(f"Weight: {weight_g:7.1f} g  |  ({weight_kg:5.2f} kg)", end="\r")

        # Update I2C LCD (padded with spaces to overwrite old digits cleanly)
        lcd.cursor_pos = (0, 0)
        lcd.write_string(f"Wt: {weight_g:7.1f} g   ")
        lcd.cursor_pos = (1, 0)
        lcd.write_string(f"    {weight_kg:6.3f} kg  ")

        time.sleep(0.2)

except (KeyboardInterrupt, SystemExit):
    print("\nStopping scale...")
    lcd.clear()
    lcd.write_string("Scale Stopped")
    time.sleep(1)
    lcd.clear()
finally:
    GPIO.cleanup()