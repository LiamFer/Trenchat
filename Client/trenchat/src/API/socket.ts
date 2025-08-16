import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
const wsUrl = import.meta.env.VITE_WS_URL;

export const createStompClient = (topic: string, onMessageReceived: (msg: any) => void) => {
  const socket = new SockJS(wsUrl || "http://192.168.101.69:3000/ws");
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    client.subscribe(`/topic/${topic}`, (msg) => {
      const data = JSON.parse(msg.body);
      onMessageReceived(data);
    });
  };

  client.activate();
  return client;
};