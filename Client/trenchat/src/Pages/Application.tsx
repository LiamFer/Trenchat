import { useEffect, useRef } from "react";
import useUser from "../Hooks/useUser";
import { useNavigate } from "react-router-dom";
import { Layout, App } from "antd";
import Sidebar from "../Components/Application/Sidebar";
import ChatWindow from "../Components/Application/ChatWindow";
import RightSidebar from "../Components/Application/RightSidebar";
import "../Styles/Application.css";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "../API/socket";

const { Content } = Layout;

export default function Application() {
  const { notification } = App.useApp();
  const stompClient = useRef<Client | null>(null);
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/");
      stompClient.current = createStompClient(user.id, (msg) => {
        notification.warning({
          message: "New Message Received",
          description: `You received a new Message!`,
          placement: "topRight",
          pauseOnHover: true,
        });
      });
    }
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [user]);

  return (
    <Layout className="app-layout">
      <Sidebar/>

      <Content className="chat-window-container">
        <ChatWindow />
      </Content>

      <RightSidebar />
    </Layout>
  );
}
