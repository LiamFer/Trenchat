import { useState } from "react";
import { Layout, Card, Avatar, Divider, Button, theme } from "antd";
import { ThunderboltOutlined, SearchOutlined } from "@ant-design/icons";
import "../../Styles/Sidebar.css";
import useUser from "../../Hooks/useUser";

const { Sider } = Layout;

const activeConversations = [
  { name: "Henry Boyd", avatar: "https://i.pravatar.cc/150?img=1", unread: 3 },
  {
    name: "Martha Curtis",
    avatar: "https://i.pravatar.cc/150?img=2",
    unread: 2,
  },
  { name: "John Doe", avatar: "https://i.pravatar.cc/150?img=3" },
  { name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=4", unread: 1 },
  { name: "Mike Brown", avatar: "https://i.pravatar.cc/150?img=5" },
  { name: "Emily White", avatar: "https://i.pravatar.cc/150?img=6", unread: 4 },
  { name: "Chris Green", avatar: "https://i.pravatar.cc/150?img=7" },
  { name: "Anna Black", avatar: "https://i.pravatar.cc/150?img=8", unread: 1 },
  { name: "Anna Black", avatar: "https://i.pravatar.cc/150?img=8", unread: 1 },
  { name: "Anna Black", avatar: "https://i.pravatar.cc/150?img=8", unread: 1 },
  // Adicione mais chats para testar scroll
];

const Sidebar = () => {
  const user = useUser();
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);

  return (
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
            src="https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg?nii=t"
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
              <div
                style={{
                  color: token.colorPrimary,
                  fontWeight: token.fontWeightStrong,
                }}
              >
                Active
              </div>
            </>
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
            {!collapsed && <span>Last Chats</span>}
            <Button type="primary" icon={<SearchOutlined />} size="small" />
          </div>

          {/* Lista de chats */}
          <div
            style={{
              flex: 1, // Faz a lista ocupar o espaço restante
              overflowY: "auto", // Scroll vertical
              display: "flex",
              flexDirection: "column",
              gap: token.marginSM,
              scrollbarWidth: "none", // Firefox
            }}
          >
            {activeConversations.map((item, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: collapsed ? "column" : "row",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  width: "100%",
                  padding: collapsed ? "8px 0" : `${token.paddingXS}px 0`,
                }}
              >
                <Avatar size={collapsed ? 40 : 48} src={item.avatar} />
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
                    {item.unread && (
                      <span
                        style={{
                          backgroundColor: token.colorError,
                          color: token.colorWhite,
                          borderRadius: "50%",
                          padding: "0 6px",
                          fontSize: token.fontSizeSM,
                        }}
                      >
                        {item.unread}
                      </span>
                    )}
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
  );
};

export default Sidebar;
