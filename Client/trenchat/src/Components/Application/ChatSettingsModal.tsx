import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Input, List, Avatar, Button, Select, Popconfirm, App, message, Skeleton } from 'antd';
import debounce from 'lodash.debounce';
import { DeleteOutlined, CrownOutlined } from '@ant-design/icons';
import { fetchChatData, searchUsers } from '../../Service/server.service';
import type { Chat } from '../../types/SocketCreatedChat';
import useUser from '../../Hooks/useUser';
import type { ChatConfig, ChatParticipant } from '../../types/Chat';

interface ChatSettingsModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (payload: { name: string; membersAdded: string[]; membersRemoved: string[] }) => Promise<void>;
    chat: Chat;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ open, onClose, onSave, chat }) => {
    const user = useUser();
    const { modal } = App.useApp();
    const [messageApi, contextHolder] = message.useMessage();
    const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
    const [editedChatName, setEditedChatName] = useState('');
    const [chatMembers, setChatMembers] = useState<ChatParticipant[]>([]);
    const [initialChatMembers, setInitialChatMembers] = useState<ChatParticipant[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Estados para a busca de usuários
    const [isSearching, setIsSearching] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState<ChatParticipant[]>([]);
    const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);

    const isOwner = user?.email === chatConfig?.owner?.email;

    useEffect(() => {
        if (open) {
            setChatConfig(null); // Reseta para mostrar o Skeleton
            const getChatConfig = async () => {
                const response = await fetchChatData(chat.id);
                if (response.success) {
                    setChatConfig(response.data);
                } else {
                    messageApi.error("Falha ao carregar dados do grupo.");
                    onClose();
                }
            };
            getChatConfig();
        } else {
            setSearchedUsers([]);
            setInitialChatMembers([]);
            setSelectedNewMembers([]);
            setChatConfig(null);
        }
    }, [open, chat.id]);

    useEffect(() => {
        if (chatConfig) {
            setEditedChatName(chatConfig.name);
            const sortedParticipants = [...chatConfig.participants].sort((a, b) => {
                if (a.email === chatConfig.owner.email) return -1;
                if (b.email === chatConfig.owner.email) return 1;
                return a.name.localeCompare(b.name);
            });
            setChatMembers(sortedParticipants);
            setInitialChatMembers(sortedParticipants);
        }
    }, [chatConfig]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const initialMemberEmails = new Set(initialChatMembers.map(m => m.email));
            const currentMemberEmails = new Set(chatMembers.map(m => m.email));

            const membersAdded = chatMembers
                .filter(member => !initialMemberEmails.has(member.email))
                .map(member => member.email);

            const membersRemoved = initialChatMembers
                .filter(member => !currentMemberEmails.has(member.email))
                .map(member => member.email);

            const payload = {
                name: editedChatName,
                membersAdded,
                membersRemoved,
            };

            await onSave(payload);
        } catch (error) {
            console.error("Falha ao salvar as alterações:", error);
            messageApi.error("Não foi possível salvar as alterações.");
        } finally {
            setIsSaving(false);
        }
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
        messageApi.warning("Membro removido com sucesso!")
    };

    const fetchUsers = async (query: string) => {
        if (query) {
            setIsSearching(true);
            try {
                const response = await searchUsers(query);
                if (response.success) {
                    setSearchedUsers(response.data as ChatParticipant[]);
                }
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchedUsers([]);
        }
    }

    const debouncedFetch = useMemo(() => debounce(fetchUsers, 400), []);
    useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

    const usersMap = useMemo(
        () =>
            searchedUsers.reduce<Record<string, ChatParticipant>>((acc, u) => {
                acc[u.email] = u;
                return acc;
            }, {}),
        [searchedUsers]
    );

    const handleAddMembers = (emails: string[]) => {
        const usersToAdd = emails
            .map(email => usersMap[email])
            .filter(user => user && !chatMembers.some(member => member.email === user.email));

        if (usersToAdd.length > 0) {
            setChatMembers(prev => [...prev, ...usersToAdd]);
        }
        setSelectedNewMembers([]);
        setSearchedUsers([]);
        messageApi.success("Membro adicionado com sucesso!")
    };

    const selectOptions = useMemo(() => searchedUsers.map(u => ({
        value: u.email,
        label: u.name,
        disabled: chatMembers.some(member => member.email === u.email)
    })), [searchedUsers, chatMembers]);

    const modalFooter = isOwner ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button key="delete" danger onClick={handleDeleteGroup}>Deletar Grupo</Button>
            <div>
                <Button key="back" onClick={onClose} style={{ marginRight: 8 }}>Cancelar</Button>
                <Button key="submit" type="primary" onClick={handleSave} loading={isSaving}>Salvar</Button>
            </div>
        </div>
    ) : (
        <Button key="close" onClick={onClose}>
            Fechar
        </Button>
    );

    return (
        <>
            {contextHolder}
            <Modal
                title="Configurações do Grupo"
                open={open}
                onOk={handleSave}
                onCancel={onClose}
                footer={modalFooter}
            >
                {!chatConfig ? (
                    <Skeleton active />
                ) : (
                    <>
                        <Input
                            key={chatConfig?.name} // Força a recriação se o nome mudar
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
                                mode="multiple"
                                value={selectedNewMembers}
                                showSearch
                                placeholder="Adicionar membro..."
                                onSearch={debouncedFetch}
                                onChange={handleAddMembers}
                                loading={isSearching}
                                filterOption={false}
                                options={selectOptions}
                                optionRender={(option) => {
                                    const user = usersMap[option.value as string];
                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Avatar src={user?.picture} size="small" />
                                            <span>{user?.name}</span>
                                        </div>
                                    );
                                }}
                                style={{ width: '100%' }}
                            />
                        )}
                    </>
                )}
            </Modal></>
    );
};

export default ChatSettingsModal;