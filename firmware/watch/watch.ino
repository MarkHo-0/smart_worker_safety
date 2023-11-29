#include <Arduino.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <Wire.h>
#include <string>

#include <ArduinoWebsockets.h>
#include <ezButton.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Fonts/FreeSans9pt7b.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define MAX_WIFI_NUM_COUNT 5;

using namespace websockets;
WebsocketsClient client;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
ezButton flashButton(0), confirmButton(27), rightButton(26), leftButton(25);

void setup() {
  Serial.setDebugOutput(true);
  Serial.begin(115200); 
	initScreen();
}

void loop() {
  refreshSensors();
  keepWifiConnectivity();
  keepServerConnectivity();
  tryKeepHelmetConnectivity();
  generateNetworkReport();
  uploadDataToServer();
}

void generateNetworkReport() {
  int wifiCount = WiFi.scanComplete();

  if (wifiCount == -1) return;

  WiFi.scanNetworks(true);
  
  if (wifiCount == 0) return;

  DynamicJsonDocument doc(1024);
  JsonArray array = doc.to<JsonArray>();

  for (int i = 0; i < wifiCount; ++i) {
    JsonObject network = array.createNestedObject();
    network["bssid"] = WiFi.BSSIDstr(i);
    network["rssi"] = WiFi.RSSI(i);
  }

  String json;
  serializeJson(array, json);
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

void refreshSensors() {
  flashButton.loop(); confirmButton.loop(); rightButton.loop(); leftButton.loop();
  if (client.available()) client.poll();
}

void keepWifiConnectivity() {
  if (WiFi.status() == WL_CONNECTED) return;

  drawTextOnCenter("Connecting to Wifi...");

  WiFi.setHostname("SmartWorkerSafety_Watch");
	WiFi.mode(WIFI_STA);
  WiFi.begin("EasyMode", "EasyMode");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

bool keepServerConnectivity() {
  if (client.available()) return true;

  drawTextOnCenter("Searching Server");
  if ((mdns_init() == ESP_OK && MDNS.queryService("ws", "tcp") > 0 && MDNS.hostname(0) == "swss") == false) {
    drawTextOnCenter("Server Not Found");
    return false;
  } 

  bool connected = false;
  int workerID = 0;

  while (!connected) {
    while (!(confirmButton.isPressed() && workerID > 0)) {
      drawTextOnCenter("Worker ID: " + String(workerID));
      if (leftButton.isPressed() && workerID >= 0) workerID--;
      if (rightButton.isPressed()) workerID++;
    }
    
    drawTextOnCenter("Connecting");
    String path = String("/worker?id=" + String(workerID));
    connected = client.connect(MDNS.IP(0).toString(), MDNS.port(0), path);

    if (connected == false) {
      drawTextOnCenter("ID Invalid");
      delay(1000);
    }
  }
}

void tryKeepHelmetConnectivity() {
  //TODO
}

void uploadDataToServer() {
  //TODO
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
