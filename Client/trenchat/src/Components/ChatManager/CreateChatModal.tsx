import { Modal, App } from "antd";
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
  const { notification } = App.useApp();


  const handleOk = async () => {
    if (selectedUsers.length > 1 && !groupName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const chatInfo = {
        isGroup: selectedUsers.length > 1,
        name: selectedUsers.length > 1 ? groupName : undefined,
        participantsEmails: selectedUsers.map((u) => u.email),
      };
      const newChat = await createChat(chatInfo);
      if (newChat.success){
        setChats((prev) => [...prev, newChat?.data as Chat]);
      } else if (newChat.error == "Este Chat já existe!"){
        notification.warning({
          message: "Couldn't create Chat",
          description: `This Chat Already Exists!`,
          placement: "topRight",
          pauseOnHover: true,
        });
      }
      setLoading(false);
      setOpen(false);
      setSelectedUsers([]);
      setGroupName("");
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
        groupName={groupName}
        setGroupName={setGroupName}
      />
    </Modal>
  );
};

export default CreateChatModal;
