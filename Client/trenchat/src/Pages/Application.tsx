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
import LandingPage from "../Components/LandingPage/LandingPage";


const { Content } = Layout;

export default function Application() {
  const stompClient = useRef<Client | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const user = useUser();
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/");
      const fetchChats = async () => {
        setIsLoadingChats(true);
        try {
          const response = await fetchUserChats();
          if (response?.success) {
            setChats(response?.data as Chat[]);
          }
        } finally {
          setIsLoadingChats(false);
        }
      };
      fetchChats();
      stompClient.current = createStompClient(
        user.id,
        (msg) => {
          if (msg?.action === "new chat") {
            setChats((prevChats) => [msg.chatDTO, ...prevChats])
            notification.info({
              message: "New Chat Created",
              description: `${msg.chatDTO.name} wants to Talk to you!`,
              placement: "topRight",
              pauseOnHover: true,
            });
          }
          else if (msg?.action === "chat updated") {
            const updatedChat = msg.chatDTO;
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat.id === updatedChat.id ? updatedChat : chat
              )
            );
            setActiveChat((currentActiveChat) =>
              currentActiveChat?.id === updatedChat.id ? updatedChat : currentActiveChat
            );
          }
          else if (msg?.action === "added to chat") {
            setChats((prevChats) => [msg.chatDTO, ...prevChats])
            notification.info({
              message: "You've been added to a chat!",
              description: `You've been added to ${msg.chatDTO.name}!`,
              placement: "topRight",
              pauseOnHover: true,
            });
          }
          else if (msg?.action === "removed from chat") {
            const chatIdToDelete = msg.chatDTO.id;
            setChats(prevChats => prevChats.filter(chat => chat.id !== chatIdToDelete));
            setActiveChat(currentActiveChat => {
              if (currentActiveChat?.id === chatIdToDelete) {
                navigate('/');
                return null;
              }
              return currentActiveChat;
            });
            notification.warning({
              message: "You've been removed from the chat!",
              description: `You've been removed from ${msg.chatDTO.name}!`,
              placement: "topRight",
              pauseOnHover: true,
            });
          }
          else if (msg?.action === "delete chat") {
            const chatIdToDelete = msg.chatDTO.id;
            setChats(prevChats => prevChats.filter(chat => chat.id !== chatIdToDelete));
            setActiveChat(currentActiveChat => {
              if (currentActiveChat?.id === chatIdToDelete) {
                navigate('/');
                return null;
              }
              return currentActiveChat;
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
      <Sidebar chats={chats} setChats={setChats} setActiveChat={setActiveChat} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} isLoading={isLoadingChats} />
      {!activeChat ? (
        <LandingPage isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      ) : (
        <Layout>
          <Content className="chat-window-container">
            <ChatWindow activeChat={activeChat} />
          </Content>
          <RightSidebar activeChat={activeChat} />
        </Layout>
      )}
    </Layout>
  );
}
