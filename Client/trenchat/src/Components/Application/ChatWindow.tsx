import React, { useEffect, useRef, useState } from "react";
import { Input, Avatar, theme } from "antd";
import "../../Styles/ChatWindow.css";
import { Client } from "@stomp/stompjs";
import useUser from "../../Hooks/useUser";
import { createStompClient } from "../../API/socket";

interface Message {
  type: "sent" | "received";
  text: string;
  user?: string;
  time: string;
}

// const messages: Message[] = [
//     { type: 'received', text: 'Hey Bill, nice to meet you!', user: 'Henry Boyd', time: '9h ago' },
//     { type: 'sent', text: 'Hi Henry!', time: '9h ago' },
// ];

const ChatWindow: React.FC = () => {
  const { token } = theme.useToken();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const user = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    stompClient.current = createStompClient("test", (msg) => {
      const newMsg: Message = {
        type: msg.sender === user?.name ? "sent" : "received",
        text: msg.content,
        user: msg.sender,
        time: new Date().toLocaleTimeString(),
      };
      if (msg.sender != user?.name) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSearch = (value: string) => {
    if (!stompClient.current || !user || value.length == 0) return;
    const payload = {
      room: "test",
      sender: user.name,
      content: value,
      timestamp: new Date().toISOString(),
    };

    stompClient.current.publish({
      destination: "/app/chatroom",
      body: JSON.stringify(payload),
    });

    const sentMessage: Message = {
      type: "sent",
      text: value,
      user: user.name,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, sentMessage]);
    setInputValue("");
  };

  return (
    <div
      className="chat-window-container"
      style={{ backgroundColor: token.colorBgLayout }}
    >
      <div
        className="chat-header"
        style={{
          backgroundColor: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        <Avatar src="https://i.pravatar.cc/150?img=1" size={48} />
        <div className="chat-header-info">
          <div
            className="chat-header-name"
            style={{ color: token.colorTextHeading }}
          >
            Henry Boyd
          </div>
          <div
            className="chat-header-status"
            style={{ color: token.colorPrimary }}
          >
            Active
          </div>
        </div>
      </div>
      <div
        className="messages-list"
        style={{ backgroundColor: token.colorBgContainer }}
      >
        {messages.map((message, index) => (
          <div key={index} className={`message-row ${message.type}`}>
            {message.type === "received" && (
              <Avatar
                src="https://i.pravatar.cc/150?img=1"
                className="message-avatar"
              />
            )}
            <div
              className={`message-bubble ${message.type}`}
              style={{
                backgroundColor:
                  message.type === "sent"
                    ? token.colorPrimary
                    : token.colorFillQuaternary,
                color: message.type === "sent" ? "#fff" : token.colorText,
              }}
            >
              <p>{message.text}</p>
              <span
                className="message-time"
                style={{ color: token.colorTextSecondary }}
              >
                {message.time}
              </span>
            </div>
            {message.type === "sent" && (
              <Avatar
                src={user?.picture || "https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg?nii=t"}
                className="message-avatar"
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div
        className="chat-input-area"
        style={{
          backgroundColor: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorder}`,
        }}
      >
        <Input
          placeholder="Enter your message here"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          onPressEnter={() => onSearch(inputValue)}
        />
        <span
          className="send-button"
          onClick={() => onSearch(inputValue)}
          style={{ color: token.colorPrimary }}
        >
          Send
        </span>
      </div>
    </div>
  );
};

export default ChatWindow;
