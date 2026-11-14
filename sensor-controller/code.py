import os
import wifi
import time
import board
import digitalio
from adafruit_seesaw.seesaw import Seesaw

# Initialize the sensor
ss = Seesaw(board.I2C())

# Status LED
led = digitalio.DigitalInOut(board.LED)
led.direction = digitalio.Direction.OUTPUT

# Wi-Fi credentials from settings.toml
SSID = os.getenv("SSID")
PASSWORD = os.getenv("PASSWORD")

def report_sensor_readings():
    # Connect to sensor and get readings

    # Report readings to server or log them

def log_message(message):
    try:
        with open("/log.txt", "a") as f:
            timestamp = time.monotonic()
            f.write(f"[{timestamp:.2f}] {message}\n")
    except OSError as e:
        print("Failed to write log:", e)


# Attempt connection with retries
max_attempts = 5
connected = False

for attempt in range(max_attempts):
    try:
        # log_message(f"Connecting to Wi-Fi (attempt {attempt + 1})...")
        # print(f"Connecting to Wi-Fi (attempt {attempt + 1})...")
        led.value = True
        wifi.radio.connect(SSID, PASSWORD)

        connected = True
        # print(f"Connection successful!")
        break

    except Exception as e:
        # log_message(f"Connection failed: {e}")
        # print(f"Connection failed: {e}")
        led.value = False
        time.sleep(5)

if not connected:
    led.value = False
    raise RuntimeError("Network connection failed")

# Connected successfully
ip_address = str(wifi.radio.ipv4_address)
print(f"Connection to Wifi successful. IP address: {ip_address}")
# log_message("Connected to Wi-Fi!")
# log_message(f"IP address: {ip_address}")

led.value = True

# Report sensor readings and timestamp
report_sensor_readings()