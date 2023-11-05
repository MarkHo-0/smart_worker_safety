#include <Arduino.h>
#include <WiFi.h>
#include <ESPmDNS.h>

#include <ArduinoWebsockets.h>
#include <ezButton.h>
#include <ArduinoJson.h>

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Fonts/FreeSerif9pt7b.h>

using namespace websockets;
WebsocketsClient client;
String deviceName = "SmartWorkerSafety_Watch_1";

Adafruit_SSD1306 display(128, 64, &Wire, -1);

ezButton flashButton(0);
ezButton confirmButton(27);
ezButton rightButton(26);
ezButton leftButton(25);

void setup() {
	Serial.begin(115200);
	Serial.setDebugOutput(true);

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println("SSD1306 allocation failed");
    return;
  }

  display.setFont(&FreeSerif9pt7b);
  display.clearDisplay();
  display.setTextSize(1);             
  display.setTextColor(WHITE);        
  display.setCursor(0,20);             
  display.println("Hello, world!");
  display.display();

  WiFi.setHostname(deviceName.c_str());
	WiFi.mode(WIFI_STA);
  WiFi.begin("WIFI_SSID", "WIFI_PWS");
  Serial.println("");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  bool connected = client.connect("Server_IP", 8080, "/?mode=m&id=1");
  if(connected) {
    Serial.println("Connected!");
  } else {
    Serial.println("Not Connected!");
  }
  
  client.onMessage([&](WebsocketsMessage message){
    Serial.print("Got Message: ");
    Serial.println(message.data());
  });
}

void loop() {
  flashButton.loop(); confirmButton.loop(); rightButton.loop(); leftButton.loop();
	if(client.available()) client.poll();

  if (confirmButton.isPressed()) Serial.println("confirm");
  if (leftButton.isPressed()) Serial.println("left");
  if (rightButton.isPressed()) Serial.println("right"); 

  if (flashButton.isPressed())
  {
    Serial.println("Scaning Netword...");
    int n = WiFi.scanNetworks();
    if (n == 0) {
      Serial.println("No networks found");
    } else {
      Serial.print(n);
      Serial.println(" networks found");

      // 建立一個動態JSON陣列來存儲網絡資訊
      DynamicJsonDocument doc(1024);
      JsonArray array = doc.to<JsonArray>();

      for (int i = 0; i < n; ++i) {
        // 建立一個JSON物件來存儲每個網絡的資訊
        JsonObject network = array.createNestedObject();
        network["ssid"] = WiFi.SSID(i);
        network["rssi"] = WiFi.RSSI(i);
      }

      // 將JSON陣列轉換為字串
      String json;
      serializeJson(array, json);
      client.send(json);
    }
  }
}