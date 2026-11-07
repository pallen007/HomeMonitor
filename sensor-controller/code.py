import os
import wifi
import time
import board
import digitalio

# Status LED
led = digitalio.DigitalInOut(board.LED)
led.direction = digitalio.Direction.OUTPUT

# Wi-Fi credentials from settings.toml
SSID = os.getenv("SSID")
PASSWORD = os.getenv("PASSWORD")


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
        log_message(f"Connecting to Wi-Fi (attempt {attempt + 1})...")

        led.value = True
        wifi.radio.connect(SSID, PASSWORD)

        connected = True
        break

    except Exception as e:
        log_message(f"Connection failed: {e}")

        led.value = False
        time.sleep(5)

if not connected:
    led.value = False
    raise RuntimeError("Network connection failed")

# Connected successfully
ip_address = str(wifi.radio.ipv4_address)

log_message("Connected to Wi-Fi!")
log_message(f"IP address: {ip_address}")

led.value = True

# Report sensor readings and timestamp