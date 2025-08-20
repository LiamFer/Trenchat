import { Modal } from "antd";
import React, { useState } from "react";
import SearchUsers, { type User } from "./SearchUsers";
import { createChat } from "../../Service/server.service";
import type { Chat } from "../../types/SocketCreatedChat";

interface CreateChatModalProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({ isOpen, setOpen, setChats }) => {
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");

  const handleOk = async () => {
    if (selectedUsers.length > 1 && !groupName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const chatInfo = {
        isGroup: selectedUsers.length > 1,
        groupName: selectedUsers.length > 1 ? groupName : undefined,
        participantsEmails: selectedUsers.map((u) => u.email),
      };
      const newChat = await createChat(chatInfo);
      setLoading(false);
      setOpen(false);
      setSelectedUsers([]);
      setGroupName("");
      setChats((prev) => [...prev, newChat?.data as Chat]);
    } catch (e) {
      setLoading(false);
    }
  };
  const handleCancel = () => setOpen(false);

  return (
    <Modal
      title="Criar novo chat"
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Criar Chat"
      cancelText="Cancelar"
      centered
      width={500}
    >
      <p style={{ marginBottom: 12, color: "#666" }}>
        Pesquise e selecione usuários para iniciar a conversa.
      </p>

      <SearchUsers
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
    </Modal>
  );
};

export default CreateChatModal;
