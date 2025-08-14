import { Layout, Spin } from "antd";

export default function Loading() {
    return (
        <Layout
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Spin size="large" percent={"auto"}></Spin>
        </Layout>
    );
}