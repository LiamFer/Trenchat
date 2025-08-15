import React, { useEffect, useRef, useState } from 'react';
import { Input, Avatar, theme } from 'antd';
import '../../Styles/ChatWindow.css';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import useUser from '../../Hooks/useUser';

interface Message {
    type: 'sent' | 'received';
    text: string;
    user?: string;
    time: string;
}

const messages: Message[] = [
    { type: 'received', text: 'Hey Bill, nice to meet you!', user: 'Henry Boyd', time: '9h ago' },
    { type: 'sent', text: 'Hi Henry!', time: '9h ago' },
    { type: 'sent', text: 'How can I help you today?', time: '9h ago' },
    { type: 'received', text: "Hope you're doing fine.", user: 'Henry Boyd', time: '9h ago' },
    { type: 'sent', text: "I'm good thanks for asking", time: '13h ago' },
    { type: 'received', text: 'I am interested to know more about your prices and services you offer', user: 'Henry Boyd', time: '9h ago' },
    { type: 'sent', text: 'Sure, please check below link to find more useful information http://maxzipixel.com/portfolio', time: '9h ago' },
    { type: 'received', text: 'Awesome, will get in touch if there’s anything unclear. Thanks for now!', user: 'Henry Boyd', time: '9h ago' },
    { type: 'received', text: 'Have a great day!', user: 'Henry Boyd', time: '9h ago' },
    { type: 'sent', text: 'Thanks buddy, you too as well', time: '9h ago' },
];

const ChatWindow: React.FC = () => {
    const { token } = theme.useToken();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState<string>('');
    const stompClient = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const user = useUser()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const socket = new SockJS('http://192.168.101.69:3000/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            client.subscribe('/topic/test', (msg) => {
                const data = JSON.parse(msg.body);

                const newMsg: Message = {
                    type: data.sender === user?.name ? 'sent' : 'received',
                    text: data.content,
                    user: data.sender,
                    time: new Date().toLocaleTimeString(),
                };
                if (data.sender != user?.name){
                    setMessages(prev => [...prev, newMsg]);
                }
            });
        };

        client.activate();
        stompClient.current = client;

        return () => {
            client.deactivate();
        };
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const onSearch = (value: string) => {
        if (!stompClient.current || !user) return;

        const payload = {
            room: "test",
            sender: user.name,  // usuário atual
            content: value,
            timestamp: new Date().toISOString()
        };

        // Envia para o backen
        stompClient.current.publish({
            destination: '/app/sendToRoom',
            body: JSON.stringify(payload)
        });

        // Adiciona localmente na lista
        const sentMessage: Message = {
            type: 'sent',
            text: value,
            user: user.name,
            time: new Date().toLocaleTimeString(),
        };

        setMessages(prev => [...prev, sentMessage]);
        setInputValue('');
    };

    return (
        <div className="chat-window-container" style={{ backgroundColor: token.colorBgLayout }}>
            <div className="chat-header" style={{ backgroundColor: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorder}` }}>
                <Avatar src="https://i.pravatar.cc/150?img=1" size={48} />
                <div className="chat-header-info">
                    <div className="chat-header-name" style={{ color: token.colorTextHeading }}>Henry Boyd</div>
                    <div className="chat-header-status" style={{ color: token.colorPrimary }}>Active</div>
                </div>
            </div>
            <div className="messages-list" style={{ backgroundColor: token.colorBgContainer }}>
                {messages.map((message, index) => (
                    <div key={index} className={`message-row ${message.type}`}>
                        {message.type === 'received' && <Avatar src="https://i.pravatar.cc/150?img=1" className="message-avatar" />}
                        <div className={`message-bubble ${message.type}`} style={{
                            backgroundColor: message.type === 'sent' ? token.colorPrimary : token.colorFillQuaternary,
                            color: message.type === 'sent' ? '#fff' : token.colorText,
                        }}>
                            <p>{message.text}</p>
                            <span className="message-time" style={{ color: token.colorTextSecondary }}>{message.time}</span>
                        </div>
                        {message.type === 'sent' && <Avatar src="https://i.pravatar.cc/150?img=11" className="message-avatar" />}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area" style={{ backgroundColor: token.colorBgContainer, borderTop: `1px solid ${token.colorBorder}` }}>
                <Input
                    placeholder="Enter your message here"
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    onPressEnter={() => onSearch(inputValue)}
                />
                <span className="send-button" onClick={() => onSearch(inputValue)} style={{ color: token.colorPrimary }}>Send</span>
            </div>
        </div>
    );
};

export default ChatWindow;
