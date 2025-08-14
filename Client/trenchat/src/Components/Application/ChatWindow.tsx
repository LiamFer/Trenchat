import React, { useState } from 'react';
import { Input, Avatar } from 'antd';
import '../../Styles/ChatWindow.css';

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
    const [inputValue, setInputValue] = useState<string>('');

    const onSearch = (value: string) => {
        // Lógica para enviar a mensagem
        console.log(value);
        setInputValue('');
    };

    return (
        <div className="chat-window-container">
            <div className="chat-header">
                <Avatar src="https://i.pravatar.cc/150?img=1" size={48} />
                <div className="chat-header-info">
                    <div className="chat-header-name">Henry Boyd</div>
                    <div className="chat-header-status">Active</div>
                </div>
            </div>
            <div className="messages-list">
                {messages.map((message, index) => (
                    <div key={index} className={`message-row ${message.type}`}>
                        {message.type === 'received' && <Avatar src="https://i.pravatar.cc/150?img=1" className="message-avatar" />}
                        <div className={`message-bubble ${message.type}`}>
                            <p>{message.text}</p>
                            <span className="message-time">{message.time}</span>
                        </div>
                        {message.type === 'sent' && <Avatar src="https://i.pravatar.cc/150?img=11" className="message-avatar" />}
                    </div>
                ))}
            </div>
            <div className="chat-input-area">
                <Input
                    placeholder="Enter your message here"
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    onPressEnter={() => onSearch(inputValue)}
                />
                <span className="send-button" onClick={() => onSearch(inputValue)}>Send</span>
            </div>
        </div>
    );
};

export default ChatWindow;