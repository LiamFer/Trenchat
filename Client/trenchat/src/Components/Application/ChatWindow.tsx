import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input, Avatar, theme } from "antd";
import "../../Styles/ChatWindow.css";
import { Client } from "@stomp/stompjs";
import useUser from "../../Hooks/useUser";
import { createStompClient } from "../../API/socket";
import type { Chat } from "../../types/SocketCreatedChat";
import Loading from "../Loading/Loading";
import { fetchChatMessages } from "../../Service/server.service";

interface Message {
    type: "sent" | "received";
    text: string;
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
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const oldScrollHeightRef = useRef<number>(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            setPage(0);

            const initialFetch = async () => {
                const initialMessages = (await fetchChatMessages(activeChat.id, 0)).data;
                setMessages(initialMessages.content);
                setHasMore(initialMessages.last !== true);
                setPage(1);
            };
            initialFetch();

            stompClient.current = createStompClient(activeChat.id, (msg) => {
                const newMsg: Message = {
                    type: msg.sender === user?.name ? "sent" : "received",
                    text: msg.content,
                    user: msg.sender,
                    picture: msg.picture,
                    time: new Date().toLocaleTimeString(),
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
    const onSend = (value: string) => {
        if (!stompClient.current || !user || value.length == 0) return;
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
            time: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, sentMessage]);
        setInputValue("");
    };

    if (!activeChat) return <Loading />;

    return (
        <div
            className="chat-window-container"
            style={{ backgroundColor: token.colorBgLayout }}
        >
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
                className="messages-list"
                ref={messageListRef}
                onScroll={() => {
                    if (messageListRef.current?.scrollTop === 0) {
                        fetchOlderMessages();
                    }
                }}
                style={{ backgroundColor: token.colorBgLayout }}
            >
                {isLoadingMore && <div style={{ textAlign: 'center', padding: '10px' }}>Carregando mais...</div>}
                {messages.map((message, index) => (
                    <div key={index} className={`message-row ${message.type}`}>
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
                            <p>{message.text}</p>
                            <span
                                className="message-time"
                                style={{ color: token.colorTextSecondary }}
                            >
                                {message.time}
                            </span>
                        </div>
                        {message.type === "sent" && (
                            <Avatar src={user?.picture} className="message-avatar" />
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div
                className="chat-input-area"
                style={{
                    backgroundColor: token.colorBgContainer,
                    borderTop: `1px solid ${token.colorBorder}`,
                }}
            >
                <Input
                    placeholder="Enter your message here"
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setInputValue(e.target.value)
                    }
                    onPressEnter={() => onSend(inputValue)}
                />
                <span
                    className="send-button"
                    onClick={() => onSend(inputValue)}
                    style={{ color: token.colorPrimary }}
                >
                    Send
                </span>
            </div>
        </div>
    );
};

export default ChatWindow;
