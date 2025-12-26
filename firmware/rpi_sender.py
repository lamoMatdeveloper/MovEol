import serial
import time
import json
import random

# CONFIGURATION
# Update this to match the Bluetooth RFCOMM port or Serial connection
# On Linux/RPi, it might be '/dev/rfcomm0' or '/dev/ttyS0'
# On Windows, it might be 'COM3'
SERIAL_PORT = 'COM3' 
BAUD_RATE = 9600

def get_simulated_data():
    """Generates simulated wind turbine data."""
    voltage = 12.0 + random.uniform(-1.0, 1.0)
    current = 2.0 + random.uniform(-0.5, 0.5)
    rpm = 300 + random.randint(-50, 50)
    power = voltage * current
    
    return {
        "voltage": round(voltage, 2),
        "current": round(current, 2),
        "power": round(power, 2),
        "rpm": rpm
    }

def main():
    print(f"MovEol Sender (Python) starting on {SERIAL_PORT}...")
    try:
        # Open serial port
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        time.sleep(2) # Wait for connection
        
        print("Connected. Sending data...")
        
        while True:
            data = get_simulated_data()
            json_data = json.dumps(data)
            
            # Send data followed by newline
            ser.write((json_data + '\n').encode('utf-8'))
            print(f"Sent: {json_data}")
            
            time.sleep(1)
            
    except serial.SerialException as e:
        print(f"Error opening serial port {SERIAL_PORT}: {e}")
        print("Hint: Check if your bluetooth device is paired and connected to this COM port.")

if __name__ == "__main__":
    main()
