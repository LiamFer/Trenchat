import { Layout, App, Typography, Button } from "antd";
import SplitText from "../ReactBits/SplitText/SplitText";
import GridDistortion from "../ReactBits/GridDistortion/GridDistortion";
const { Title, Paragraph } = Typography;
const { Content } = Layout;

export default function LandingPage({ isModalOpen, setIsModalOpen }) {
    return (
        <Content
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                overflow: "hidden",
            }}
        >
            <GridDistortion
                imageSrc="https://raw.githubusercontent.com/dharmx/walls/main/m-26.jp/a_person_on_a_surfboard_in_the_ocean.jpg"
                grid={10}
                mouse={0.25}
                strength={0.15}
                relaxation={0.9}
            />
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0px",
                    padding: "20px",
                }}
            >
                <div style={{ fontSize: '2rem', color: "white", margin: 0 }}>
                    <SplitText
                        tag="h1"
                        text="Stay ahead of the curve."
                        className="leading-none font-bold text-white text-center"
                        delay={50}
                        duration={0.3}
                        ease="power3.out"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-150px"
                        textAlign="center"
                    />
                </div>

                <div style={{ fontSize: '1.2rem', color: "white", margin: 0 }}>
                    <SplitText
                        tag="p"
                        text="Discover what’s trending and chat with the people who get it."
                        className="font-light text-gray-200 text-center"
                        delay={50}
                        duration={0.4}
                        ease="power3.out"
                        splitType="words"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="center"
                    />
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
                    <Button type="primary" size="large" onClick={() => setIsModalOpen(true)}>Start a Chat</Button>
                    <Button
                        size="large"
                        ghost
                        style={{ color: "white", borderColor: "white" }}
                        href="https://github.com/LiamFer/Trenchat"
                        target="_blank"
                        rel="noopener noreferrer"
                    >View on GitHub</Button>
                </div>
            </div>
        </Content>
    );
}