package com.liamfer.Trenchat.service;

import com.liamfer.Trenchat.dto.chat.CreateChatDTO;
import com.liamfer.Trenchat.dto.chat.CreatedChatDTO;
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

    public CreatedChatDTO createChat(CreateChatDTO createChatDTO, UserDetails userDetails){
        UserEntity user = findUserByEmail(userDetails.getUsername());
        ChatEntity chat = new ChatEntity();
        if(createChatDTO.isGroup()){
            chat.setName(createChatDTO.name());
            chat.setIsGroup(true);
        }

        Set<UserEntity> participants = new HashSet<>();
        participants.add(findUserByEmail(userDetails.getUsername()));
        createChatDTO.participantsEmails().forEach(email -> {
            participants.add(findUserByEmail(email));
        });

        chat.setParticipants(participants);

        CreatedChatDTO createdChatDTO = modelMapper.map(chatRepository.save(chat), CreatedChatDTO.class);

        getParticipantsIds(createChatDTO.participantsEmails()).forEach(id ->{
            createdChatDTO.setName(user.getName());
            messagingTemplate.convertAndSend("/topic/" + id, createdChatDTO);
        });

        createdChatDTO.setName(participants.stream().findFirst().get().getName());
        return createdChatDTO;
    }

    public List<String> getParticipantsIds (List<String> participantsEmails){
        return participantsEmails.stream().map(email -> findUserByEmail(email).getId()).toList();
    }

    private UserEntity findUserByEmail(String email){
        Optional<UserEntity> user = userRepository.findByEmail(email);
        if(user.isPresent()){
            return user.get();
        }
        throw new EntityNotFoundException("Usuário não Encontrado");
    }

}
