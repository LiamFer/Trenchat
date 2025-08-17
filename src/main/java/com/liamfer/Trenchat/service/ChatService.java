package com.liamfer.Trenchat.service;

import com.liamfer.Trenchat.dto.chat.CreateChatDTO;
import com.liamfer.Trenchat.dto.chat.ChatDTO;
import com.liamfer.Trenchat.dto.chat.SocketCreatedChatDTO;
import com.liamfer.Trenchat.entity.ChatEntity;
import com.liamfer.Trenchat.entity.UserEntity;
import com.liamfer.Trenchat.repository.ChatRepository;
import com.liamfer.Trenchat.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ChatService {
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatRepository chatRepository, UserRepository userRepository, ModelMapper modelMapper, SimpMessagingTemplate messagingTemplate) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.messagingTemplate = messagingTemplate;
    }

    public ChatDTO createChat(CreateChatDTO createChatDTO, UserDetails userDetails) {
        UserEntity user = findUserByEmail(userDetails.getUsername());
        ChatEntity chat = new ChatEntity();
        if (createChatDTO.isGroup()) {
            chat.setName(createChatDTO.name());
            chat.setIsGroup(true);
        }

        Set<UserEntity> participants = new HashSet<>();
        participants.add(findUserByEmail(userDetails.getUsername()));
        createChatDTO.participantsEmails().forEach(email -> {
            participants.add(findUserByEmail(email));
        });

        chat.setParticipants(participants);

        ChatDTO chatDTO = modelMapper.map(chatRepository.save(chat), ChatDTO.class);

        UserEntity participant = participants.stream().findFirst().get();

        chatDTO.setPicture(user.getPicture());
        chatDTO.setName(user.getName());
        getParticipantsIds(createChatDTO.participantsEmails()).forEach(id -> {
            messagingTemplate.convertAndSend("/topic/" + id, new SocketCreatedChatDTO("new chat", chatDTO));
        });

        chatDTO.setPicture(participant.getPicture());
        chatDTO.setName(participant.getName());
        return chatDTO;
    }

    public List<ChatDTO> fetchUserChats(UserDetails userDetails) {
        UserEntity user = findUserByEmail(userDetails.getUsername());
        return chatRepository.findAllByParticipantsId(user.getId()).stream().map(chat -> {
            ChatDTO chatDTO = modelMapper.map(chat, ChatDTO.class);
            UserEntity other = chat.getParticipants().stream().filter(p -> p.getId()!=user.getId()).findFirst().orElseThrow();
            chatDTO.setName(other.getName());
            chatDTO.setPicture(other.getPicture());
            return chatDTO;
        }).toList();
    }

    public List<String> getParticipantsIds(List<String> participantsEmails) {
        return participantsEmails.stream().map(email -> findUserByEmail(email).getId()).toList();
    }

    private UserEntity findUserByEmail(String email) {
        Optional<UserEntity> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return user.get();
        }
        throw new EntityNotFoundException("Usuário não Encontrado");
    }

}
