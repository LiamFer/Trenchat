import React, { useState } from 'react';
import { Card, theme, Typography, Divider, Empty, Layout } from 'antd';
import '../../Styles/RightSidebar.css';
import type { Chat } from '../../types/SocketCreatedChat';
import ClickableAvatar from './ClickableAvatar';

const { Sider } = Layout;
const { Title, Text } = Typography;

interface RightSidebarProps {
    activeChat: Chat | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ activeChat }) => {
    const { token } = theme.useToken();
    const [collapsed, setCollapsed] = useState(false);

    if (!activeChat) {
        return null;
    }

    return (
        <Sider
            theme="light"
            width={260}
            breakpoint="lg"
            collapsedWidth={0}
            onBreakpoint={setCollapsed}
            collapsed={collapsed}
            trigger={null}
            className="right-sidebar-container"
            style={{
                backgroundColor: token.colorBgContainer,
                padding: collapsed ? 0 : token.paddingMD,
                borderLeft: `1px solid ${token.colorBorderSecondary}`,
                transition: 'all 0.2s',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: collapsed ? 'none' : 'block', height: '100%', overflowY: 'auto' }}>
                <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                    <ClickableAvatar size={80} src={activeChat.picture} style={{ marginBottom: token.margin }} />
                    <Title level={4} style={{ marginBottom: token.marginXXS }}>{activeChat.name}</Title>
                    <Text type="secondary">Online</Text>
                </Card>

                <Divider />

                <Card title="Arquivos Compartilhados" bordered={false} style={{ background: 'transparent' }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Nenhum arquivo compartilhado"
                    />
                </Card>
            </div>
        </Sider>
    );
};

export default RightSidebar;