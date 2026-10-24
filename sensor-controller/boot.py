import board
import digitalio
import storage

# Set up a pin to act as a read/write switch (e.g., GP0)
switch = digitalio.DigitalInOut(board.GP0)
switch.direction = digitalio.Direction.INPUT
switch.pull = digitalio.Pull.UP

# If GP0 is connected to a GND pin at boot, switch.value becomes False
## DO NOT FORGET TO INSTALL THE JUMPER WIRE WHEN PREPARING THE SENSOR FOR USE
if not switch.value:
    # CircuitPython takes write access; Computer becomes READ-ONLY
    storage.remount("/", readonly=False)
else:
    # Computer retains write access; CircuitPython is READ-ONLY
    storage.remount("/", readonly=True)
