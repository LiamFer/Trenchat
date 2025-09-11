import { useEffect, useRef, useState } from "react";
import useUser from "../Hooks/useUser";
import { useNavigate } from "react-router-dom";
import { Layout, App } from "antd";
import Sidebar from "../Components/Application/Sidebar";
import ChatWindow from "../Components/Application/ChatWindow";
import RightSidebar from "../Components/Application/RightSidebar";
import "../Styles/Application.css";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "../API/socket";
import type { Chat, SocketCreatedChat } from "../types/SocketCreatedChat";
import { fetchUserChats } from "../Service/server.service";

const { Content } = Layout;

export default function Application() {
  const stompClient = useRef<Client | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const user = useUser();
  const navigate = useNavigate();
  const { notification } = App.useApp();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/");
      const fetchChats = async () => {
        const response = await fetchUserChats();
        if (response?.success) {
          setChats(response?.data as Chat[]);
        }
      };
      fetchChats();
      stompClient.current = createStompClient(
        user.id,
        (msg: SocketCreatedChat) => {
          if (msg?.action == "new chat") {
            setChats((prevChats) => [...prevChats, msg.chatDTO])
            notification.info({
              message: "New Chat Created",
              description: `${msg.chatDTO.name} wants to Talk to you!`,
              placement: "topRight",
              pauseOnHover: true,
            });
          }
        }
      );
    }
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [user]);

  return (
    <Layout className="app-layout">
      <Sidebar chats={chats} setChats={setChats} setActiveChat={setActiveChat} />
      {activeChat && (
        <>
          <Content className="chat-window-container">
            <ChatWindow activeChat={activeChat} />
          </Content>
          <RightSidebar activeChat={activeChat} />
        </>
      )}
    </Layout>
  );
}
