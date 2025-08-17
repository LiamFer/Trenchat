export type Chat = {
  id: string;
  name: string;
  picture: string;
};

export type SocketCreatedChat = {
  action: string;
  chatDTO: Chat;
};
