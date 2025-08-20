import React, { useMemo, useState, useEffect } from "react";
import { Select, Avatar, List, Button, Spin, Input } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import debounce from "lodash.debounce";
import { searchUsers } from "../../Service/server.service";

export interface User {
  name: string;
  email: string;
  picture: string;
}

interface Props {
  selectedUsers: User[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>;
  groupName: string;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
}

const SearchUsers: React.FC<Props> = ({ selectedUsers, setSelectedUsers, groupName, setGroupName }) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  const addUser = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.email === user.email) ? prev : [...prev, user]
    );
  };

  const removeUser = (email: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.email !== email));
  };

  const fetchUsers = async (q: string) => {
    if (!q?.trim()) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const resp = await searchUsers(q);
      if (resp?.success) setOptions(resp.data as User[]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchUsers, 400), []);
  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

  const usersMap = useMemo(
    () =>
      options.reduce<Record<string, User>>((acc, u) => {
        acc[u.email] = u;
        return acc;
      }, {}),
    [options]
  );

  return (
    <div>
      <Select
        showSearch
        value={searchValue}
        onSearch={(v) => {
          setSearchValue(v);
          debouncedFetch(v);
        }}
        onSelect={(email: string) => {
          const user = usersMap[email];
          if (user) addUser(user);
          setSearchValue(""); // limpa input depois
        }}
        filterOption={false}
        options={options.map((u) => ({
          value: u.email,
          label: u.name,
        }))}
        optionRender={(opt) => {
          const u = usersMap[opt.value];
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar src={u?.picture} size="small" />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontWeight: 500 }}>{u?.name}</span>
                <span style={{ fontSize: 12, color: "#888" }}>{u?.email}</span>
              </div>
            </div>
          );
        }}
        placeholder="Pesquisar usuários..."
        style={{ width: "100%" }}
        notFoundContent={loading ? <Spin size="small" /> : null}
        dropdownStyle={{ maxHeight: 280, overflowY: "auto" }}
      />

      {/* Campo para nome do grupo */}
      {selectedUsers.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <Input
            placeholder="Digite o nome do grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <List
            dataSource={selectedUsers}
            renderItem={(u) => (
              <List.Item
                style={{ padding: "8px 0" }}
                actions={[
                  <Button
                    key="remove"
                    size="small"
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => removeUser(u.email)}
                  >
                    Remover
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={u.picture} />}
                  title={<span style={{ fontWeight: 500 }}>{u.name}</span>}
                  description={<span style={{ color: "#888" }}>{u.email}</span>}
                />
              </List.Item>
            )}
          />
        </div>
      )}

      
    </div>
  );
};

export default SearchUsers;
