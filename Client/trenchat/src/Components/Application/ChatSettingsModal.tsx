import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Avatar, Button, Select, Popconfirm, App } from 'antd';
import { DeleteOutlined, CrownOutlined } from '@ant-design/icons';
import { searchUsers } from '../../Service/server.service';
import type { Chat } from '../../types/SocketCreatedChat';
import useUser from '../../Hooks/useUser';
import type { ChatConfig, ChatParticipant } from '../../types/Chat';

interface ChatSettingsModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (details: { name: string; members: ChatParticipant[] }) => void;
    chat: Chat;
    chatConfig: ChatConfig
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ open, onClose, onSave, chat, chatConfig }) => {
    const user = useUser();
    const { modal } = App.useApp();
    const [editedChatName, setEditedChatName] = useState('');
    const [chatMembers, setChatMembers] = useState<ChatParticipant[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState<{ value: string; label: string; picture: string }[]>([]);

    const isOwner = user?.email === chatConfig?.owner?.email;

    useEffect(() => {
        if (open) {
            if (chatConfig) {
                setEditedChatName(chatConfig.name);
                const sortedParticipants = [...chatConfig.participants].sort((a, b) => {
                    if (a.email === chatConfig.owner.email) return -1;
                    if (b.email === chatConfig.owner.email) return 1;
                    return a.name.localeCompare(b.name);
                });
                setChatMembers(sortedParticipants);
            }
        } else {
            setSearchedUsers([]);
        }
    }, [open, chatConfig, user]);

    const handleSave = () => {
        onSave({ name: editedChatName, members: chatMembers });
    };

    const handleDeleteGroup = () => {
        modal.confirm({
            title: 'Deletar Grupo',
            content: 'Você tem certeza que deseja deletar este grupo? Esta ação não pode ser desfeita.',
            okText: 'Deletar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => {
                // TODO: Implementar chamada de API para deletar o grupo
                console.log("Deletando grupo:", chat.id);
                onClose(); // Fecha o modal de configurações após a deleção
            },
        });
    };

    const handleRemoveMember = (memberEmail: string) => {
        setChatMembers(prev => prev.filter(member => member.email !== memberEmail));
    };

    const handleAddMember = (value: string, option: any) => {
        const newMember: ChatParticipant = {
            email: value, // Assumindo que o 'value' é o email
            name: option.rawLabel,
            picture: option.picture,
        };
        if (!chatMembers.some(member => member.email === newMember.email)) {
            setChatMembers(prev => [...prev, newMember]);
        }
        setSearchedUsers([]);
    };

    const handleUserSearch = async (query: string) => {
        if (query) {
            setIsSearching(true);
            try {
                const response = await searchUsers(query);
                if (response.success) {
                    const users = response.data.map((u: any) => ({
                        value: u.id,
                        label: u.name,
                        picture: u.picture,
                    }));
                    setSearchedUsers(users);
                }
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchedUsers([]);
        }
    };

    const renderSearchedUserOption = (option: { value: string; label: string; picture: string }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={option.picture} size="small" style={{ marginRight: 8 }} />
            {option.label}
        </div>
    );

    return (
        <Modal
            title="Configurações do Grupo"
            open={open}
            onOk={handleSave}
            onCancel={onClose}
            footer={isOwner ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button key="delete" danger onClick={handleDeleteGroup}>
                        Deletar Grupo
                    </Button>
                    <div>
                        <Button key="back" onClick={onClose} style={{ marginRight: 8 }}>
                            Cancelar
                        </Button>
                        <Button key="submit" type="primary" onClick={handleSave}>
                            Salvar
                        </Button>
                    </div>
                </div>
            ) : (
                <Button key="close" onClick={onClose}>
                    Fechar
                </Button>
            )}
        >
            <Input
                addonBefore="Nome do Grupo"
                value={editedChatName}
                onChange={(e) => setEditedChatName(e.target.value)}
                style={{ marginBottom: '20px' }}
                disabled={!isOwner}
            />

            <h4 style={{ marginBottom: '10px' }}>Membros</h4>
            <List
                itemLayout="horizontal"
                dataSource={chatMembers}
                renderItem={(member) => (
                    <List.Item
                        style={member.email === chatConfig.owner.email ? { opacity: 0.7 } : {}}
                        actions={isOwner && member.email !== user.email ? [
                            <Popconfirm
                                title="Remover membro"
                                description="Tem certeza que deseja remover este membro?"
                                onConfirm={() => handleRemoveMember(member.email)}
                                okText="Sim"
                                cancelText="Não"
                            >
                                <Button shape="circle" danger type="text" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        ] : []}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={member.picture} />}
                            title={
                                <span>
                                    {member.name}
                                    {member.email === chatConfig.owner.email && (
                                        <CrownOutlined style={{ marginLeft: 8, color: '#faad14' }} />
                                    )}
                                </span>
                            }
                            description={member.email}
                        />
                    </List.Item>
                )}
                style={{ marginBottom: '20px', maxHeight: '150px', overflowY: 'auto' }}
            />

            {isOwner && (
                <Select
                    showSearch
                    placeholder="Adicionar membro..."
                    onSearch={handleUserSearch}
                    onSelect={handleAddMember}
                    loading={isSearching}
                    filterOption={false}
                    options={searchedUsers.map(u => ({
                        value: u.value,
                        label: renderSearchedUserOption(u),
                        rawLabel: u.label,
                        picture: u.picture
                    }))}
                    style={{ width: '100%' }}
                />
            )}
        </Modal>
    );
};

export default ChatSettingsModal;