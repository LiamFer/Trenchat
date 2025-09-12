import { useState } from "react";
import { Layout, Card, Avatar, Divider, Button, theme, Tag, Skeleton } from "antd";
import {
  ThunderboltOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "../../Styles/Sidebar.css";
import useUser from "../../Hooks/useUser";
import CreateChatModal from "./../ChatManager/CreateChatModal";
import type { Chat } from "../../types/SocketCreatedChat";
import ProfilePictureModal from "./ProfilePictureModal";

const { Sider } = Layout;

interface SidebarProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  setChats,
  setActiveChat,
  isModalOpen,
  setIsModalOpen,
  isLoading,
}) => {
  const user = useUser();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        theme="light"
        width={260}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: token.paddingMD,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Logo */}
          <div
            className="quickchat-logo"
            style={{
              marginBottom: token.marginLG,
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-start",
              alignItems: "center",
            }}
          >
            <ThunderboltOutlined
              className="logo-icon"
              style={{ color: token.colorPrimary }}
            />
            {!collapsed && (
              <span
                style={{
                  fontSize: token.fontSizeLG,
                  fontWeight: token.fontWeightStrong,
                  marginLeft: token.marginXS,
                }}
              >
                Trenchat
              </span>
            )}
          </div>

          {/* Perfil do usuário */}
          <Card
            bordered={false}
            style={{
              position: "relative", // necessário para posicionar o botão
              background: "transparent",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: token.paddingXS,
            }}
          >
            <Avatar
              size={collapsed ? 40 : 64}
              src={user?.picture}
              style={{
                marginBottom: collapsed ? 0 : token.marginSM,
                flexShrink: 0,
              }}
            />
            {!collapsed && (
              <>
                <div
                  style={{
                    fontSize: token.fontSizeLG,
                    fontWeight: token.fontWeightStrong,
                    marginBottom: token.marginXXS,
                    color: token.colorTextHeading,
                  }}
                >
                  {user?.name}
                </div>

                <Tag color="processing">Active</Tag>
              </>
            )}

            {!collapsed && (
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setOpen(true)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  padding: 0,
                  fontSize: token.fontSizeLG,
                  color: token.colorTextSecondary,
                }}
              />
            )}
          </Card>

          <Divider style={{ borderColor: token.colorBorder }} />

          {/* Últimas conversas com scroll */}
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflowY: "hidden",
            }}
          >
            {/* Cabeçalho */}
            <div
              style={{
                display: "flex",
                justifyContent: collapsed ? "center" : "space-between",
                alignItems: "center",
                marginBottom: token.marginSM,
                width: "100%",
              }}
            >
              {!collapsed && <Tag bordered={false}>Last Chats</Tag>}
              <Button
                type="primary"
                icon={<SearchOutlined />}
                size="small"
                onClick={showModal}
              />
            </div>

            {/* Lista de chats */}
            <div
              style={{
                flex: 1, // Faz a lista ocupar o espaço restante
                overflowY: "auto", // Scroll vertical
                display: "flex",
                flexDirection: "column",
                gap: token.marginSM,
                scrollbarWidth: "none",
              }}
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      padding: collapsed ? "8px" : `${token.paddingXS}px`,
                    }}
                  >
                    <Skeleton.Avatar active size={collapsed ? 40 : 48} shape="circle" />
                    {!collapsed && (
                      <div style={{ marginLeft: token.marginSM, width: "100%" }}>
                        <Skeleton active title={false} paragraph={{ rows: 2, width: ['80%', '50%'] }} />
                      </div>
                    )}
                  </div>
                ))
                : chats.map((item, index) => (
                  <div
                    key={index}
                    className="conversation-item"
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: collapsed ? "column" : "row",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      width: "100%",
                      padding: collapsed ? "8px" : `${token.paddingXS}px`,
                    }}
                    onClick={() => setActiveChat(item)}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      token.colorBgContainerDisabled)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Avatar size={collapsed ? 40 : 48} src={item?.picture} />
                    {!collapsed && (
                      <>
                        <div style={{ marginLeft: token.marginSM, flexGrow: 1 }}>
                          <div style={{ fontWeight: token.fontWeightStrong }}>
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: token.fontSizeSM,
                              color: token.colorTextSecondary,
                            }}
                          >
                            {item.name === "Henry Boyd" ? "Active" : ""}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <Divider style={{ borderColor: token.colorBorder }} />

          {/* Arquivadas */}
          {/* <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: token.paddingSM,
          }}
        >
          {!collapsed && <span>Archived Conversations</span>}
          {!collapsed && (
            <span
              style={{
                backgroundColor: token.colorFillTertiary,
                fontSize: token.fontSizeSM,
                marginLeft: token.marginXS,
                padding: "2px 6px",
                borderRadius: token.borderRadiusSM,
              }}
            >
              7
            </span>
          )}
        </div> */}
        </div>
      </Sider>
      <CreateChatModal isOpen={isModalOpen} setOpen={setIsModalOpen} setChats={setChats} />
      <ProfilePictureModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default Sidebar;
