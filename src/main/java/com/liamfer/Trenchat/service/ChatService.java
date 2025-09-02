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
    private final String groupPicture;

    public ChatService(ChatRepository chatRepository, UserRepository userRepository, ModelMapper modelMapper, SimpMessagingTemplate messagingTemplate) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.messagingTemplate = messagingTemplate;
        this.groupPicture = "https://cdn-icons-png.flaticon.com/512/6387/6387947.png";

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

        getParticipantsIds(createChatDTO.participantsEmails()).forEach(id -> {
            ChatDTO dtoForOther = modelMapper.map(chatDTO, ChatDTO.class);
            dtoForOther.setName(createChatDTO.isGroup() ? createChatDTO.name() : user.getName());
            dtoForOther.setPicture(createChatDTO.isGroup() ? groupPicture : user.getPicture());
            messagingTemplate.convertAndSend("/topic/" + id, new SocketCreatedChatDTO("new chat", dtoForOther));
        });

        if(createChatDTO.isGroup()){
            chatDTO.setName(createChatDTO.name());
            chatDTO.setPicture(groupPicture);
            return chatDTO;
        }

        UserEntity otherParticipant = participants.stream()
                .filter(p -> !p.getId().equals(user.getId()))
                .findFirst()
                .orElse(user);
        chatDTO.setName(otherParticipant.getName());
        chatDTO.setPicture(otherParticipant.getPicture());
        return chatDTO;
    }

    public List<ChatDTO> fetchUserChats(UserDetails userDetails) {
        UserEntity user = findUserByEmail(userDetails.getUsername());
        return chatRepository.findAllByParticipantsId(user.getId()).stream().map(chat -> {
            ChatDTO chatDTO = modelMapper.map(chat, ChatDTO.class);

            if(chat.getIsGroup()){
                chatDTO.setName(chat.getName());
                chatDTO.setPicture(groupPicture);
                return chatDTO;
            }

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
