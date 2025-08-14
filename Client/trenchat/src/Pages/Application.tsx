import { useEffect } from "react";
import useUser from "../Hooks/useUser";
import { useNavigate } from "react-router-dom";
import { Layout, Row, Col } from 'antd';
import Sidebar from '../Components/Application/Sidebar';
import ChatWindow from '../Components/Application/ChatWindow';
import RightSidebar from '../Components/Application/RightSidebar';
import '../Styles/Application.css';

const { Content } = Layout;

export default function Application() {
    const user = useUser();
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate("/login");
        } else {
            navigate("/")
        }
    }, [user]);

    return (
        <Layout className="app-layout">
            <Row className="main-row">
                <Col span={5} className="sidebar-col">
                    <Sidebar />
                </Col>
                <Col span={14} className="chat-window-col">
                    <Content className="chat-content">
                        <ChatWindow />
                    </Content>
                </Col>
                <Col span={5} className="right-sidebar-col">
                    <RightSidebar />
                </Col>
            </Row>
        </Layout>
    );
};
