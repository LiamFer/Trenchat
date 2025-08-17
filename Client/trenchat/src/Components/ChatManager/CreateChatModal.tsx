import { Button, Modal } from "antd";
import React, { useState } from "react";
import SearchUsers from "./SearchUsers";

export default function CreateChatModal({ isOpen, setOpen }) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const handleOk = async () => {
    setLoading(true);
    try {
      // aqui você chamaria a API para criar o chat
      console.log("Criar chat com usuários:", selected);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 1500);
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
        <SearchUsers />
      </div>

      {selected.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Participantes selecionados:</strong>
          <ul style={{ marginTop: 6 }}>
            {selected.map((id) => (
              <li key={id} style={{ color: "#555" }}>
                {id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
