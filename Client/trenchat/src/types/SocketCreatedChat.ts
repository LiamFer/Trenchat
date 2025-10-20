export type Chat = {
  id: string;
  name: string;
  picture: string;
  unreadCount: number;
};

export type SocketCreatedChat = {
  action: string;
  chatDTO: Chat;
};
