export interface ChatParticipant {
    email: string;
    name: string;
    picture: string;
}

export interface ChatConfig {
    id: string;
    name: string;
    isGroup: boolean;
    owner: ChatParticipant;
    participants: ChatParticipant[];
}