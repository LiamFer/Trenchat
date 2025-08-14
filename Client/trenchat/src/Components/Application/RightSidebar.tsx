import React from 'react';
import { Card, Avatar, Button, Col, Row, Statistic } from 'antd';
import { MailOutlined, FolderOutlined } from '@ant-design/icons';
import '../../Styles/RightSidebar.css';

const RightSidebar: React.FC = () => {
    return (
        <div className="right-sidebar-container">
            <Card className="profile-card" bordered={false}>
                <div className="profile-avatar-container">
                    <Avatar size={80}>HB</Avatar>
                </div>
                <div className="profile-info">
                    <h4>Henry Boyd</h4>
                    <div className="email-link">
                        <MailOutlined />
                        <span>henryboyd@gmail.com</span>
                    </div>
                    <div className="archive-button-container">
                        <Button icon={<FolderOutlined />}>Archive</Button>
                    </div>
                </div>
            </Card>

            <Row gutter={[16, 16]} className="stats-row">
                <Col span={8}>
                    <Statistic title="13h" value="Online" />
                </Col>
                <Col span={8}>
                    <Statistic title="188" value="Attended" />
                </Col>
                <Col span={8}>
                    <Statistic title="119" value="Meetings" />
                </Col>
                <Col span={8}>
                    <Statistic title="41" value="Rejected" />
                </Col>
            </Row>

            <Card title="Current week" className="current-week-card" bordered={false}>
                <div className="current-week-chart">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="chart-bar-container">
                            <div className="chart-bar" style={{ height: `${(index + 1) * 10}px` }}></div>
                            <span className="chart-day">{day}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Onboard Clients" className="onboard-clients-card" bordered={false}>
                <p>Share the link with prospects and discuss all stuff</p>
                <Button block type="primary">
                    Copy Link
                </Button>
            </Card>
        </div>
    );
};

export default RightSidebar;