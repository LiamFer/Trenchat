import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Input, theme, Button, Spin, Image, Popover, Tooltip } from "antd";
import "../../Styles/ChatWindow.css";
import { Client } from "@stomp/stompjs";
import useUser from "../../Hooks/useUser";
import { createStompClient } from "../../API/socket";
import type { Chat } from "../../types/SocketCreatedChat";
import Loading from "../Loading/Loading";
import { fetchChatData, fetchChatMessages, sendImage, updateChatDetails } from "../../Service/server.service";
import GradualBlur from "../ReactBits/GradualBlur/GradualBlur";
import AnimatedContent from "../ReactBits/AnimatedContent/AnimatedContent";
import { PaperClipOutlined, SendOutlined, CloseOutlined, SettingOutlined, SmileOutlined } from "@ant-design/icons";
import ImageUploadOverlay from "../ReactBits/ImageUploadOverlay";
import ChatSettingsModal from "./ChatSettingsModal";
import type { ChatConfig } from "../../types/Chat";
import ClickableAvatar from "./ClickableAvatar";
import emojiData from '@emoji-mart/data';

interface Message {
    type: "sent" | "received";
    text?: string;
    imageUrl?: string;
    user?: string;
    picture?: string;
    time: string;
}

interface Member {
    id: string;
    name: string;
    picture: string;
}

interface ChatWindowProps {
    activeChat: Chat | null;
}

// Estrutura para armazenar emojis com dados para busca
interface EmojiInfo {
    char: string;
    keywords: string[];
}

// Mapeamento de categorias para os ícones que você quer usar
const categoryIconMap: Record<string, string> = {
    people: '😊',
    nature: '🐶',
    foods: '🍕',
    activity: '⚽',
    places: '✈️',
    objects: '💡',
    symbols: '❤️',
    flags: '🚩',
};

const EMOJI_CATEGORIES = [
    { id: 'people', name: 'Smileys & People' },
    { id: 'nature', name: 'Animals & Nature' },
    { id: 'foods', name: 'Food & Drink' },
    { id: 'activity', name: 'Activity' },
    { id: 'places', name: 'Travel & Places' },
    { id: 'objects', name: 'Objects' },
    { id: 'symbols', name: 'Symbols' },
    { id: 'flags', name: 'Flags' },
];

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChat }) => {
    const { token } = theme.useToken();
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
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

    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [emojiSearchTerm, setEmojiSearchTerm] = useState('');
    const dragCounter = useRef(0);

    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
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
                setChatConfig((await fetchChatData(activeChat.id)).data);
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

    useEffect(() => {
        if (!isLoadingMore && messageListRef.current) {
            const timer = setTimeout(() => {
                scrollToBottom();
            }, 50);
            return () => clearTimeout(timer);
        }
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

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    handleImageSelected(file);
                    e.preventDefault();
                    break;
                }
            }
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setInputValue((prev) => prev + emoji);
    };

    // Memoiza a criação do índice de busca para performance
    const emojiSearchIndex = useMemo(() => {
        const index: EmojiInfo[] = [];
        for (const emojiId in emojiData.emojis) {
            const emoji = emojiData.emojis[emojiId];
            index.push({
                char: emoji.skins[0].native,
                keywords: [emoji.id, emoji.name, ...emoji.keywords],
            });
        }
        return index;
    }, []);

    const filteredEmojis = useMemo(() => {
        if (emojiSearchTerm) {
            const lowerCaseSearch = emojiSearchTerm.toLowerCase();
            return emojiSearchIndex
                .filter(emoji => emoji.keywords.some(kw => kw.includes(lowerCaseSearch)))
                .map(emoji => emoji.char);
        }
        // Se não há busca, mostra emojis da categoria selecionada
        const categoryId = EMOJI_CATEGORIES[activeEmojiCategory].id;
        const emojiIds = emojiData.categories.find(c => c.id === categoryId)?.emojis || [];
        return emojiIds.map(id => emojiData.emojis[id].skins[0].native);
    }, [emojiSearchTerm, activeEmojiCategory, emojiSearchIndex]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmojiSearchTerm(e.target.value);
    };

    const emojiPickerContent = (
        <div
            style={{
                width: '300px',
                backgroundColor: token.colorBgContainer,
                borderRadius: '8px',
                overflow: 'hidden',
            }}
        >
            <Input
                placeholder="Buscar emoji..."
                value={emojiSearchTerm}
                onChange={handleSearchChange}
                style={{ margin: '8px', width: 'calc(100% - 16px)' }}
                allowClear
            />
            <div
                style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '8px',
                    borderBottom: `1px solid ${token.colorBorder}`,
                    overflowX: 'auto',
                }}
            >
                {!emojiSearchTerm && EMOJI_CATEGORIES.map((cat, idx) => (
                    <Tooltip title={cat.name} key={cat.id}>
                        <button
                            onClick={() => setActiveEmojiCategory(idx)}
                            style={{
                                background: activeEmojiCategory === idx ? token.colorPrimary : 'transparent',
                                color: activeEmojiCategory === idx ? '#fff' : token.colorText,
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                            }}
                        >
                            {categoryIconMap[cat.id]}
                        </button>
                    </Tooltip>
                ))}
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '4px',
                    padding: '0 8px 8px 8px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                }}
            >
                {filteredEmojis.map((emoji, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleEmojiClick(emoji)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = token.colorBgElevated}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );

    const onSend = async (value: string) => {
        if (!stompClient.current || !user) return;

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
            setPreviewImage(null);
            setFileToSend(null);
            setInputValue("");
            return;
        }

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

    const showSettingsModal = () => {
        setIsSettingsModalVisible(true);
    };

    const handleSettingsCancel = () => {
        setIsSettingsModalVisible(false);
    };

    const handleSettingsSave = async (payload: { name: string; membersAdded: string[]; membersRemoved: string[] }): Promise<void> => {
        try {
            const response = await updateChatDetails(activeChat?.id, payload);
            if (response?.success) {
                setChatConfig(response.data as ChatConfig);
                setIsSettingsModalVisible(false);
            }
        } catch (error) {
            console.error("Erro ao atualizar o chat:", error);
            throw error;
        }
    };

    if (!activeChat || initialLoading) return <Loading />;

    return (
        <div
            className="chat-window-container"
            style={{ backgroundColor: token.colorBgLayout }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
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
                <ClickableAvatar src={activeChat?.picture} size={48} />
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
                {chatConfig?.isGroup && (
                    <div className="chat-header-actions">
                        <Button
                            shape="circle"
                            type="text"
                            icon={<SettingOutlined />}
                            onClick={showSettingsModal} />
                    </div>
                )}
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
                            scroller={messageListRef.current}
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
                                    <ClickableAvatar src={message.picture} className="message-avatar" />
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
                                        <div><Image
                                            src={message.imageUrl}
                                            alt="imagem enviada"
                                            style={{ maxWidth: '250px', borderRadius: '8px' }}
                                            onLoad={scrollToBottom}
                                        />
                                            <p>{message.text}</p></div>
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
                                    <ClickableAvatar src={user?.picture} className="message-avatar" />
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

            {previewImage && (
                <div className="image-preview-container" style={{ background: token.colorBgContainer, borderTop: `1px solid ${token.colorBorder}` }}>
                    <div className="image-preview-wrapper">
                        <img src={previewImage} alt="Preview" className="image-preview-thumb" />
                        <Button
                            shape="circle"
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => { setPreviewImage(null); setFileToSend(null); }}
                            className="image-preview-close-btn"
                            aria-label="Remover imagem"
                        />
                    </div>
                </div>
            )}

            <div
                className="chat-input-area"
                style={{
                    backgroundColor: token.colorBgContainer,
                    borderTop: previewImage ? 'none' : `1px solid ${token.colorBorder}`,
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
                    aria-label="Anexar imagem"
                    icon={<PaperClipOutlined />}
                    type="text"
                    shape="circle"
                    onClick={() => fileInputRef.current?.click()}
                />
                <Popover
                    content={emojiPickerContent}
                    trigger="click"
                    placement="topLeft"
                    open={isEmojiPickerOpen}
                    onOpenChange={setIsEmojiPickerOpen}
                >
                    <Button aria-label="Selecionar emoji" icon={<SmileOutlined />} type="text" shape="circle" />
                </Popover>
                <Input.TextArea
                    placeholder="Digite sua mensagem..."
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setInputValue(e.target.value)
                    }
                    onPressEnter={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                        if (!e.shiftKey && !isUploading) {
                            e.preventDefault();
                            onSend(inputValue);
                        }
                    }}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPaste={handlePaste}
                    className="chat-textarea"
                />
                <Button
                    aria-label="Enviar mensagem"
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    onClick={() => onSend(inputValue)}
                    disabled={(!inputValue.trim() && !fileToSend) || isUploading}
                />
            </div>

            {isSettingsModalVisible && (
                <ChatSettingsModal
                    open={isSettingsModalVisible}
                    onClose={handleSettingsCancel}
                    onSave={handleSettingsSave}
                    chat={activeChat}
                />
            )}
        </div>
    );
};

export default ChatWindow;
