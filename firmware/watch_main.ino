/*
 * WebSocketClient.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

	switch(type) {
		case WStype_DISCONNECTED:
			Serial.printf("[WSc] Disconnected!\n");
			break;
		case WStype_CONNECTED: {
			Serial.printf("[WSc] Connected to url: %s\n", payload);

			// send message to server when Connected
			webSocket.sendTXT("Connected");
		}
			break;
		case WStype_TEXT:
			Serial.printf("[WSc] get text: %s\n", payload);

			// send message to server
			// webSocket.sendTXT("message here");
    }

}

void setup() {
	// USE_SERIAL.begin(921600);
	Serial.begin(115200);
  pinMode(0, INPUT_PULLUP);

	//Serial.setDebugOutput(true);
	Serial.setDebugOutput(true);

	WiFi.mode(WIFI_STA);
  WiFi.begin("EasyMode", "EasyMode");
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

	// server address, port and URL
	webSocket.begin(" 192.168.71.52", 8080, "/");

	// event handler
	webSocket.onEvent(webSocketEvent);

	// try ever 5000 again if connection has failed
	webSocket.setReconnectInterval(5000);
  
  // start heartbeat (optional)
  // ping server every 15000 ms
  // expect pong from server within 3000 ms
  // consider connection disconnected if pong is not received 2 times
  webSocket.enableHeartbeat(15000, 3000, 2);

}

boolean ButtonWasPressed = false;
const unsigned long DebounceTime = 10;
unsigned long ButtonStateChangeTime = 0;

void loop() {
	webSocket.loop();

  unsigned long currentTime = millis();
  boolean buttonIsPressed = digitalRead(0) == LOW;  // Active LOW

  // Check for button state change and do debounce
  if (buttonIsPressed != ButtonWasPressed &&
      currentTime  -  ButtonStateChangeTime > DebounceTime)
  {
    // Button state has changed
    ButtonWasPressed = buttonIsPressed;
    ButtonStateChangeTime = currentTime;


    if (ButtonWasPressed)
    {
      webSocket.sendTXT("Pressed!");
    }
  }
}