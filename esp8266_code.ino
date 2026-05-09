#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>

// Pins
#define DHTPIN D5
#define DHTTYPE DHT11

// LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// WiFi
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

// Server
const char* serverUrl = "https://your-render-app-url.onrender.com"; // Replace with actual Render URL

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.init();
  lcd.backlight();

  // Connect to WiFi
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("CONNECTING TO");
  lcd.setCursor(0, 1);
  lcd.print("WiFi..........");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("CONNECTED TO");
  lcd.setCursor(0, 1);
  lcd.print("WiFi");
  delay(2000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("-- WELCOME --");
  delay(2000);
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Display Temperature
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("TEMPERATURE");
  lcd.setCursor(0, 1);
  lcd.print(String(temp) + " 'C");
  delay(2000);

  // Display Humidity
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("HUMIDITY");
  lcd.setCursor(0, 1);
  lcd.print(String(hum) + "%");
  delay(2000);

  // Fetch and display LCD text
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // For simplicity, ignore cert
    HTTPClient http;
    String url = String(serverUrl) + "/get-lcd-text";
    http.begin(client, url);
    int httpCode = http.GET();
    if (httpCode > 0) {
      String payload = http.getString();
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("SISTec DISPLAY");
      lcd.setCursor(0, 1);
      lcd.print(payload.substring(0, 16)); // Max 16 chars
    }
    http.end();
  }
  delay(3000);

  // Send data
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SENDING DATA TO");
  lcd.setCursor(0, 1);
  lcd.print("WEB SERVER....");
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    String url = String(serverUrl) + "/save-data?temp=" + String(temp) + "&hum=" + String(hum);
    http.begin(client, url);
    int httpCode = http.GET();
    if (httpCode > 0) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("DATA SENT...!!");
      delay(1000);
    }
    http.end();
  }

  delay(10000); // Wait before next loop
}