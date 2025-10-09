import { useState } from "react";
import { Layout, Card, Divider, Button, theme, Tag, Skeleton, Modal } from "antd";
import {
  ThunderboltOutlined,
  SearchOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "../../Styles/Sidebar.css";
import useUser from "../../Hooks/useUser";
import CreateChatModal from "./../ChatManager/CreateChatModal";
import type { Chat } from "../../types/SocketCreatedChat";
import ProfilePictureModal from "./ProfilePictureModal";
import ClickableAvatar from "./ClickableAvatar";
import { serverApi } from "../../API/server";

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

  const handleLogout = () => {
    Modal.confirm({
      title: 'Você tem certeza que deseja sair?',
      icon: <LogoutOutlined />,
      content: 'Você será redirecionado para a tela de login.',
      okText: 'Sair',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          // Chama o endpoint de logout no backend. O backend deve invalidar o cookie HttpOnly.
          await serverApi.post('/auth/logout');
        } catch (error) {
          console.error("Falha na requisição de logout, deslogando no cliente.", error);
        } finally {
          // Força o redirecionamento para a página de login, limpando todo o estado da aplicação.
          window.location.href = '/login';
        }
      },
    });
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
            <ClickableAvatar
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
                    <ClickableAvatar size={collapsed ? 40 : 48} src={item?.picture} />
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

          {/* Botão de Logout */}
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              marginTop: 'auto', // Empurra o botão para o final
            }}
          >
            {!collapsed && 'Logout'}
          </Button>
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
