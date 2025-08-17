import React, { useState, useMemo } from "react";
import { Select, Avatar, Tag, Spin } from "antd";
import debounce from "lodash.debounce";
import { searchUsers } from "../../Service/server.service";

interface User {
  name: string;
  email: string;
  picture: string;
}

export default function SearchUsers({ selectedUsers, setSelectedUsers }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async (query: string) => {
    setLoading(true);
    const response = await searchUsers(query);
    if (response?.success) {
      setUsers(response.data);
    }
    setLoading(false);
  };

  // Debounce para evitar muitas chamadas à API
  const debouncedFetch = useMemo(() => debounce(fetchUsers, 500), []);

  return (
    <Select
      mode="multiple"
      value={selectedUsers}
      onChange={(vals: User[]) => setSelectedUsers(vals)}
      maxCount={1}
      style={{ width: "100%" }}
      placeholder="Pesquisar usuários..."
      showSearch
      onSearch={(value) => {
        debouncedFetch(value);
      }}
      notFoundContent={loading ? <Spin size="small" /> : null}
      optionLabelProp="label"
      options={users.map((user) => ({
        value: user.email,
        label: user.name,
        user,
      }))}
      optionRender={(option) => {
        const u = (option.data as any).user as User;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar src={u.picture} size="small" />
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
        const u = users.find((usr) => usr.email === value);
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
            <Avatar src={u.picture} size="small" />
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
