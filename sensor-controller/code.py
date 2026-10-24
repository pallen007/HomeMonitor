import os
import network
import time

# Enter your Wi-Fi credentials
SSID = os.getenv("SSID")
PASSWORD = os.getenv("PASSWORD")

def log_message(message):
    try:
        # Open file in append mode
        with open("/log.txt", "a") as f:
            timestamp = time.monotonic()
            f.write(f"[{timestamp:.2f}] {message}\n")
    except OSError as e:
        print("Failed to write log. Is the board in read-only mode?", e)

# Initialize Wi-Fi in Station mode (client mode)
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

# Wait for connection with a timeout/retry loop
max_wait = 5
while max_wait > 0:
    if wlan.status() < 0 or wlan.status() >= 3:
        break
    max_wait -= 1
    log_message("Waiting for connection...")
    time.sleep(5)

# Handle connection result
if wlan.status() != 3:
    raise RuntimeError('network connection failed')
else:
    log_message("Connected to Wi-Fi!")
    status = wlan.ifconfig()
    log_message(f"IP address: {status[0]}")
    # Report sensor readings and timestamp
