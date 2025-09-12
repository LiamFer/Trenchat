import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input, Avatar, theme, Modal, Button, Spin } from "antd";
import "../../Styles/ChatWindow.css";
import { Client } from "@stomp/stompjs";
import useUser from "../../Hooks/useUser";
import { createStompClient } from "../../API/socket";
import type { Chat } from "../../types/SocketCreatedChat";
import Loading from "../Loading/Loading";
import { fetchChatMessages, sendImage } from "../../Service/server.service";
import GradualBlur from "../ReactBits/GradualBlur/GradualBlur";
import AnimatedContent from "../ReactBits/AnimatedContent/AnimatedContent";
import { PaperClipOutlined } from "@ant-design/icons";
import ImageUploadOverlay from "../ReactBits/ImageUploadOverlay";

interface Message {
    type: "sent" | "received";
    text?: string;
    imageUrl?: string;
    user?: string;
    picture?: string;
    time: string;
}

interface ChatWindowProps {
    activeChat: Chat | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChat }) => {
    const { token } = theme.useToken();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const stompClient = useRef<Client | null>(null);
    const user = useUser();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messageListRef = useRef<HTMLDivElement | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [initialLoading, setinitialLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const oldScrollHeightRef = useRef<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [fileToSend, setFileToSend] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dragCounter = useRef(0);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    };

    const fetchOlderMessages = async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);

        if (messageListRef.current) {
            oldScrollHeightRef.current = messageListRef.current.scrollHeight;
        }

        const olderMessages = (await fetchChatMessages(activeChat.id, page)).data

        setMessages((prevMessages) => [...olderMessages.content, ...prevMessages]);
        setHasMore(olderMessages.last !== false)
        setPage((prevPage) => prevPage + 1);
        setIsLoadingMore(false);
    };

    useEffect(() => {
        if (activeChat && user) {
            setIsInitialLoad(true);
            setPage(0);

            const initialFetch = async () => {
                setinitialLoading(true)
                const initialMessages = (await fetchChatMessages(activeChat.id, 0)).data;
                setMessages(initialMessages.content);
                setHasMore(initialMessages.last !== true);
                setPage(1);
                setinitialLoading(false)
            };
            initialFetch();

            stompClient.current = createStompClient(activeChat.id, (msg) => {
                const newMsg: Message = {
                    type: msg.sender === user?.name ? "sent" : "received",
                    text: msg.content,
                    imageUrl: msg.imageUrl,
                    user: msg.sender,
                    picture: msg.picture,
                    time: new Date().toISOString(),
                };
                if (msg.sender !== user.name) {
                    setMessages((prev) => [...prev, newMsg]);
                }
            });

        }
        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [user, activeChat]);

    useEffect(() => {
        setMessages([]);
        setHasMore(true);
    }, [activeChat]);

    useEffect(() => {
        if (messages.length > 0 && isInitialLoad) {
            const timer = setTimeout(() => {
                setIsInitialLoad(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [messages, isInitialLoad]);

    const lastMessageRef = useRef<Message>();
    useEffect(() => {
        const currentLastMessage = messages[messages.length - 1];
        // Apenas rola para baixo se uma nova mensagem foi adicionada ao final
        if (
            messages.length > 0 &&
            currentLastMessage !== lastMessageRef.current &&
            !isLoadingMore
        ) {
            scrollToBottom();
        }
        lastMessageRef.current = currentLastMessage;
    }, [messages, isLoadingMore]);

    useLayoutEffect(() => {
        if (isLoadingMore && messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight - oldScrollHeightRef.current;
        }
    }, [messages, isLoadingMore]);

    const handleImageSelected = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
                setFileToSend(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSend = async (value: string) => {
        if (!stompClient.current || !user) return;

        // Lógica para enviar imagem
        if (fileToSend && previewImage) {
            setIsUploading(true);
            const response = await sendImage(fileToSend);
            setIsUploading(false);

            if (response?.success) {
                const imageUrl = response.data.url;
                const payload = {
                    room: activeChat.id,
                    sender: user.name,
                    content: value,
                    imageUrl: imageUrl,
                    picture: user.picture,
                    timestamp: new Date().toISOString(),
                };

                stompClient.current.publish({
                    destination: "/app/chatroom",
                    body: JSON.stringify(payload),
                });

                const sentMessage: Message = {
                    type: "sent",
                    text: value,
                    imageUrl: imageUrl,
                    user: user.name,
                    picture: user.picture,
                    time: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, sentMessage]);
            }
            // Limpa o preview
            setPreviewImage(null);
            setFileToSend(null);
            setInputValue("");
            return;
        }

        // Lógica para enviar texto
        if (value.trim().length > 0) {
            const payload = {
                room: activeChat.id,
                sender: user.name,
                content: value,
                picture: user.picture,
                timestamp: new Date().toISOString(),
            };

            stompClient.current.publish({
                destination: "/app/chatroom",
                body: JSON.stringify(payload),
            });

            const sentMessage: Message = {
                type: "sent",
                text: value,
                user: user.name,
                picture: user.picture,
                time: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, sentMessage]);
            setInputValue("");
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageSelected(e.dataTransfer.files[0]);
        }
    };

    const formatMessageTime = (isoString: string) => {
        const messageDate = new Date(isoString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const isToday = messageDate.getDate() === today.getDate() &&
            messageDate.getMonth() === today.getMonth() &&
            messageDate.getFullYear() === today.getFullYear();

        const isYesterday = messageDate.getDate() === yesterday.getDate() &&
            messageDate.getMonth() === yesterday.getMonth() &&
            messageDate.getFullYear() === yesterday.getFullYear();

        if (isToday) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (isYesterday) {
            return `Ontem, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return messageDate.toLocaleDateString('pt-BR', options);
        }
    };


    if (!activeChat || initialLoading) return <Loading />;

    return (
        <div
            className="chat-window-container"
            style={{ backgroundColor: token.colorBgLayout }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()} // Necessário para o onDrop funcionar
            onDrop={handleDrop}
        >
            <ImageUploadOverlay visible={isDragging} />
            <div
                className="chat-header"
                style={{
                    backgroundColor: token.colorBgContainer,
                    borderBottom: `1px solid ${token.colorBorder}`,
                }}
            >
                <Avatar src={activeChat?.picture} size={48} />
                <div className="chat-header-info">
                    <div
                        className="chat-header-name"
                        style={{ color: token.colorTextHeading }}
                    >
                        {activeChat?.name}
                    </div>
                    <div
                        className="chat-header-status"
                        style={{ color: token.colorPrimary }}
                    >
                        Active
                    </div>
                </div>
            </div>
            <div
                style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
            >

                <div
                    className="messages-list"
                    ref={messageListRef}
                    onScroll={() => {
                        if (messageListRef.current?.scrollTop === 0) {
                            fetchOlderMessages();
                        }
                    }}
                    style={{ backgroundColor: token.colorBgLayout, height: '100%', overflowY: 'auto' }}
                >
                    {isLoadingMore && <div style={{ textAlign: 'center', padding: '10px' }}>Carregando mais...</div>}
                    {messages.map((message, index) => (
                        <AnimatedContent
                            key={index}
                            scroller={messageListRef.current} // Keep this to specify the scroll container
                            distance={50}
                            direction="vertical"
                            duration={0.5}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            threshold={0.1}
                            delay={isInitialLoad ? index * 0.05 : 0}
                        >
                            <div className={`message-row ${message.type}`}>
                                {message.type === "received" && (
                                    <Avatar src={message.picture} className="message-avatar" />
                                )}
                                <div
                                    className={`message-bubble ${message.type}`}
                                    style={{
                                        backgroundColor:
                                            message.type === "sent"
                                                ? token.colorPrimary
                                                : token.colorFillQuaternary,
                                        color: message.type === "sent" ? "#fff" : token.colorText,
                                    }}
                                >
                                    {message.imageUrl ? (
                                        <img src={message.imageUrl} alt="imagem enviada" style={{ maxWidth: '250px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.open(message.imageUrl, '_blank')} />
                                    ) : (
                                        <p>{message.text}</p>
                                    )}
                                    <span
                                        className="message-time"
                                        style={{ color: token.colorTextSecondary }}
                                    >
                                        {formatMessageTime(message.time)}
                                    </span>
                                </div>
                                {message.type === "sent" && (
                                    <Avatar src={user?.picture} className="message-avatar" />
                                )}
                            </div>
                        </AnimatedContent>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <GradualBlur
                    target="parent"
                    position="bottom"
                    height="3rem"
                    strength={2}
                    divCount={5}
                    curve="bezier"
                    exponential={true}
                    opacity={1}
                />
            </div>

            <div
                className="chat-input-area"
                style={{
                    backgroundColor: token.colorBgContainer,
                    borderTop: `1px solid ${token.colorBorder}`,
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            handleImageSelected(e.target.files[0]);
                            e.target.value = ''; // Permite selecionar o mesmo arquivo novamente
                        }
                    }}
                />
                <Button
                    icon={<PaperClipOutlined />}
                    type="text"
                    onClick={() => fileInputRef.current?.click()}
                />
                <Input
                    placeholder="Enter your message here"
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setInputValue(e.target.value)
                    }
                    onPressEnter={() => onSend(inputValue)}
                />
                <Button type="primary" onClick={() => onSend(inputValue)}>Send</Button>
            </div>
            <Modal
                title="Enviar Imagem"
                open={!!previewImage}
                onCancel={() => { setPreviewImage(null); setFileToSend(null); }}
                footer={[
                    <Button key="back" onClick={() => { setPreviewImage(null); setFileToSend(null); }}>
                        Cancelar
                    </Button>,
                    <Button key="submit" type="primary" loading={isUploading} onClick={() => onSend('')}>
                        {isUploading ? 'Enviando...' : 'Enviar'}
                    </Button>,
                ]}
            >
                {previewImage && <img alt="preview" style={{ width: '100%' }} src={previewImage} />}
            </Modal>
        </div>
    );
};

export default ChatWindow;
