import { FloatButton, Layout } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useAppConfigs } from "../Context/App";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

export default function AppWireframe() {
    const { toggleTheme, darkMode } = useAppConfigs();

    return (
        <Layout
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column"}}
        >

            <Content
                style={{ flexGrow: 1, padding: "0px" }}
            >
                <Outlet></Outlet>
            </Content>


            <FloatButton
                icon={darkMode ? <MoonOutlined /> : <SunOutlined />}
                onClick={toggleTheme}
            ></FloatButton>
        </Layout>
    );
}