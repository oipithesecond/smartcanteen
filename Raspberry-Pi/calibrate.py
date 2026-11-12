import time
import sys
import statistics
import RPi.GPIO as GPIO
from hx711 import HX711

# Update these BCM pin numbers if your DT and SCK wires use different GPIOs
DT_PIN = 5
SCK_PIN = 6

GPIO.setwarnings(False)
hx = HX711(dout_pin=DT_PIN, pd_sck_pin=SCK_PIN)
hx.reset()

def read_clean_average(samples=15):
    raw_list = hx.get_raw_data(samples)
    # Filter out False/invalid readings if any occur
    valid = [x for x in raw_list if isinstance(x, (int, float))]
    if not valid:
        raise RuntimeError("No valid data received from HX711. Check DT/SCK wiring and 3.3V/5V power.")
    return statistics.mean(valid)

try:
    print("Place no weight on the scale. Taring in 3 seconds...")
    time.sleep(3)
    zero_offset = read_clean_average(20)
    print(f"Zero offset recorded: {zero_offset:.2f}")

    input("\nPlace a known weight on the scale and press Enter...")
    raw_with_weight = read_clean_average(20)
    print(f"Raw reading with weight: {raw_with_weight:.2f}")

    known_weight = float(input("Enter the exact weight you placed (in grams): "))
    scale_ratio = (raw_with_weight - zero_offset) / known_weight
    print(f"\nCalibration complete! Save these two values for your main code:")
    print(f"  ZERO_OFFSET = {zero_offset:.2f}")
    print(f"  SCALE_RATIO = {scale_ratio:.4f}")

    print("\nReading live weight (Press Ctrl+C to stop)...")
    while True:
        current_raw = read_clean_average(10)
        weight_grams = (current_raw - zero_offset) / scale_ratio
        print(f"Weight: {weight_grams:.2f} g")
        time.sleep(0.3)

except (KeyboardInterrupt, SystemExit):
    print("\nCleaning up GPIO pins and exiting...")
    GPIO.cleanup()
    sys.exit()