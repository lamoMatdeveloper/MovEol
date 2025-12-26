#include <SoftwareSerial.h>

// Bluetooth Module HC-05/HC-06 connection
// TX of Bluetooth -> Pin 10 of Arduino
// RX of Bluetooth -> Pin 11 of Arduino
SoftwareSerial BTSerial(10, 11); // RX, TX

float voltage = 0.0;
float current = 0.0;
float power = 0.0;
int rpm = 0;

void setup() {
  // Debugging on standard Serial (USB)
  Serial.begin(9600);
  
  // Bluetooth communication
  BTSerial.begin(9600);
  
  Serial.println("MovEol Turbine Sender Started...");
}

void loop() {
  // Simulate sensor data (In real implementation, read from sensors here)
  // Generating random fluctuation for MVP demonstration
  voltage = 12.0 + ((float)random(-10, 10) / 10.0); // 11.0 - 13.0 V
  current = 2.0 + ((float)random(-5, 5) / 10.0);   // 1.5 - 2.5 A
  rpm = 300 + random(-50, 50);                     // 250 - 350 RPM
  
  // Calculate Power
  power = voltage * current;

  // Create JSON string
  // Format: {"voltage": 12.50, "current": 2.10, "power": 26.25, "rpm": 320}
  String json = "{\"voltage\":";
  json += String(voltage, 2);
  json += ",\"current\":";
  json += String(current, 2);
  json += ",\"power\":";
  json += String(power, 2);
  json += ",\"rpm\":";
  json += String(rpm);
  json += "}";

  // Send to Bluetooth
  BTSerial.println(json);
  
  // Also Echo to USB Serial for debugging
  Serial.println(json);

  delay(1000); // Update every second
}
