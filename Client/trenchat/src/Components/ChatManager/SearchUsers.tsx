import React from "react";
import { Select, Avatar, Tag } from "antd";
import type { SelectProps } from "antd";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const users: User[] = [
  {
    id: "1",
    name: "William Fernandes",
    email: "william@email.com",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Maria Souza",
    email: "maria@email.com",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    name: "João Silva",
    email: "joao@email.com",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
];

const options: SelectProps["options"] = users.map((user) => ({
  value: user.email, // aqui value é o ID do user
  label: user.name, // label oficial (usado internamente)
  user, // extra (usado no optionRender)
}));

export default function SearchUsers() {
  return (
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      placeholder="Pesquisar usuários..."
      options={options}
      optionRender={(option) => {
        const u = (option.data as any).user as User;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar src={u.avatar} size="small" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "1.2",
              }}
            >
              <span style={{ fontWeight: 500 }}>{u.name}</span>
              <span style={{ fontSize: 12, color: "#888" }}>{u.email}</span>
            </div>
          </div>
        );
      }}
      tagRender={({ value, closable, onClose }) => {
        const u = users.find((usr) => usr.id === value);
        if (!u) return null;

        return (
          <Tag
            bordered={false}
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 16,
              padding: "2px 8px",
              margin: "2px 4px",
              maxWidth: 200,
            }}
          >
            <Avatar src={u.avatar} size="small" />
            <span
              style={{
                marginLeft: 6,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {u.name}
            </span>
            {closable && (
              <span
                style={{ marginLeft: 6, cursor: "pointer", fontWeight: "bold" }}
                onClick={onClose}
              >
                ×
              </span>
            )}
          </Tag>
        );
      }}
    />
  );
}
