#include <Arduino.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <Wire.h>

#include <ArduinoWebsockets.h>
#include <ezButton.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Fonts/FreeSans9pt7b.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

using namespace websockets;
WebsocketsClient client;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
ezButton flashButton(0);
ezButton confirmButton(27);
ezButton rightButton(26);
ezButton leftButton(25);

void setup() {
  Serial.setDebugOutput(true);
	initScreen();

  drawTextOnCenter("Connecting to Wifi...");
  WiFi.setHostname("SmartWorkerSafety_Watch_1");
	WiFi.mode(WIFI_STA);
  WiFi.begin("EasyMode", "EasyMode");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  drawTextOnCenter("Searching Server");
  if ((mdns_init() == ESP_OK && MDNS.queryService("ws", "tcp") > 0 && MDNS.hostname(0) == "sws_s") == false) {
    drawTextOnCenter("Server Not Found");
    return;
  } 

  drawTextOnCenter("Connecting Server");
  bool connected = client.connect(MDNS.IP(0).toString(), MDNS.port(0), "/worker?id=1");
  if(connected == false) {
    drawTextOnCenter("Faild to Connect Server");
    return;
  }
  
  drawTextOnCenter("Wellcome Back");
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

void initScreen() {
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println("SSD1306 allocation failed");
    return;
  }

  display.setFont(&FreeSans9pt7b);
  display.clearDisplay();
  display.setTextSize(1);             
  display.setTextColor(WHITE);      
  display.display();  
}

void drawTextOnCenter(String text) {
  display.clearDisplay();
  int16_t x1, y1;
  uint16_t w, h;
  display.getTextBounds(text, 0, 0, &x1, &y1, &w, &h);
  display.setCursor((SCREEN_WIDTH - w) / 2, (SCREEN_HEIGHT - h) / 2);
  display.println(text);
  display.display();
}
