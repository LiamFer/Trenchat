import { Modal } from "antd";
import React, { useState } from "react";
import SearchUsers from "./SearchUsers";
import { createChat } from "../../Service/server.service";
import type { Chat } from "../../types/SocketCreatedChat";

interface CreateChatModalProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}


const CreateChatModal: React.FC<CreateChatModalProps> = ({ isOpen, setOpen, setChats }) => {
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleOk = async () => {
    setLoading(true);
    try {
      const chatInfo = { isGroup: false, participantsEmails: selectedUsers };
      const newChat = await createChat(chatInfo);
      setLoading(false);
      setOpen(false);
      setSelectedUsers([]);
      setChats((prev) => [...prev, newChat?.data as Chat])
    } catch (e) {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

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
        Selecione um ou mais usuários para iniciar a conversa.
      </p>

      <div style={{ marginBottom: 16 }}>
        <SearchUsers
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
      </div>
    </Modal>
  );
}

export default CreateChatModal