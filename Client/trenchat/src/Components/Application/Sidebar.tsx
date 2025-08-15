import { Card, Avatar, List, Menu, Divider } from 'antd';
import { ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import '../../Styles/Sidebar.css';
import useUser from '../../Hooks/useUser';

const { Meta } = Card;

const activeConversations = [
    { name: 'Henry Boyd', avatar: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Martha Curtis', avatar: 'https://i.pravatar.cc/150?img=2', unread: 2 },
];

const archivedConversations = [
    // Dados de conversas arquivadas
];

const Sidebar = () => {
    const user = useUser()

    return (
        <div className="sidebar-container">
            <div className="quickchat-logo">
                <ThunderboltOutlined className="logo-icon" />
                <span className="logo-text">Trenchat</span>
            </div>

            <Card className="user-profile-card" bordered={false}>
                <Meta
                    avatar={<Avatar size={64} src="https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg?nii=t" />}
                    title={user?.name}
                    description="Lead UX/UI Designer"
                />
                <div className="user-status">Active</div>
            </Card>

            <Divider />

            <div className="conversations-section">
                <div className="section-header">
                    <span>Active Conversations</span>
                    <span className="count-badge">4</span>
                </div>
                <List
                    itemLayout="horizontal"
                    dataSource={activeConversations}
                    renderItem={(item) => (
                        <List.Item className="conversation-item">
                            <List.Item.Meta
                                avatar={<Avatar src={item.avatar} />}
                                title={<span>{item.name}</span>}
                                description={item.name === 'Henry Boyd' ? 'Active' : ''}
                            />
                            {item.unread && <span className="unread-badge">{item.unread}</span>}
                        </List.Item>
                    )}
                />
            </div>

            <Divider />

            <div className="conversations-section">
                <div className="section-header">
                    <span>Arhived Conversations</span>
                    <span className="count-badge">7</span>
                </div>
                {/* Você pode adicionar a lista de conversas arquivadas aqui */}
            </div>
        </div>
    );
};

export default Sidebar;