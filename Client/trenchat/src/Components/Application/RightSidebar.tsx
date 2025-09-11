import React from 'react';
import { Card, Avatar, theme, Typography, Divider, Empty } from 'antd';
import '../../Styles/RightSidebar.css';
import type { Chat } from '../../types/SocketCreatedChat';

const { Title, Text } = Typography;

interface RightSidebarProps {
    activeChat: Chat | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ activeChat }) => {
    const { token } = theme.useToken();

    if (!activeChat) {
        return null;
    }

    return (
        <div className="right-sidebar-container" style={{ "backgroundColor": token.colorBgContainer, padding: token.paddingMD }}>
            <Card bordered={false} style={{ textAlign: 'center', background: 'transparent' }}>
                <Avatar size={80} src={activeChat.picture} style={{ marginBottom: token.margin }} />
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
    );
};

export default RightSidebar;