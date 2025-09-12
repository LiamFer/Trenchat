package com.liamfer.Trenchat.service;

import com.liamfer.Trenchat.dto.chat.*;
import com.liamfer.Trenchat.dto.cloudinary.CloudinaryPictureResponse;
import com.liamfer.Trenchat.entity.ChatEntity;
import com.liamfer.Trenchat.entity.MessageEntity;
import com.liamfer.Trenchat.entity.UserEntity;
import com.liamfer.Trenchat.exceptions.ChatAlreadyExists;
import com.liamfer.Trenchat.repository.ChatRepository;
import com.liamfer.Trenchat.repository.MessageRepository;
import com.liamfer.Trenchat.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChatService {
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final MessageRepository messageRepository;
    private final ModelMapper modelMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final String groupPicture;

    public ChatService(ChatRepository chatRepository, UserRepository userRepository, CloudinaryService cloudinaryService, MessageRepository messageRepository, ModelMapper modelMapper, SimpMessagingTemplate messagingTemplate) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.messageRepository = messageRepository;
        this.modelMapper = modelMapper;
        this.messagingTemplate = messagingTemplate;
        this.groupPicture = "https://play-lh.googleusercontent.com/G__EbWgggxFojII6xvmXf2Fq4_qGGH1jM2plkrO-TxJHyeLPMOzhmAhKgA27rf0Yxul0";

    }

    public ChatDTO createChat(CreateChatDTO createChatDTO, UserDetails userDetails) {
        UserEntity user = findUserByEmail(userDetails.getUsername());
        ChatEntity chat = new ChatEntity();

        if (!createChatDTO.isGroup()){
            checkIfChatCanBeCreated(user,createChatDTO);
        }


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

    public void sendMessage(ChatMessage message,String email){
        UserEntity user = findUserByEmail(email);
        ChatEntity chat = findChatById(message.room());
        messageRepository.save(new MessageEntity(chat,user,message.content(),message.imageUrl()));
        messagingTemplate.convertAndSend("/topic/" + message.room(), message);
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

    public Page<MessageDTO> getChatMessages(String chatId, Pageable pageable, UserDetails userDetails){
        return messageRepository.findAllByChatId(chatId,pageable).map(message -> {
            String type = message.getSender().getEmail().equals(userDetails.getUsername()) ? "sent" : "received";
            return new MessageDTO(type, message.getContent(),message.getImageUrl(), message.getSender().getName(), message.getSender().getPicture(), message.getCreatedAt().toString());
        });
    }

    public List<String> getParticipantsIds(List<String> participantsEmails) {
        return participantsEmails.stream().map(email -> findUserByEmail(email).getId()).toList();
    }

    public CloudinaryPictureResponse uploadImage(MultipartFile image, UserDetails userDetails){
        String picture = cloudinaryService.addImage(image,UUID.randomUUID().toString(),"/images");
        return new CloudinaryPictureResponse(picture);
    }

    private void checkIfChatCanBeCreated(UserEntity user,CreateChatDTO createChatDTO){
        List<ChatEntity> chats = chatRepository.findAllByParticipantsId(user.getId())
                .stream()
                .filter(chat -> chat.getParticipants().size() == 2)
                .toList();
        Set<String> newChatEmails = new HashSet<>(createChatDTO.participantsEmails());
        newChatEmails.add(user.getEmail());
        chats.forEach(chat -> {
            Set<String> existingChatEmails = chat.getParticipants()
                    .stream()
                    .map(UserEntity::getEmail)
                    .collect(Collectors.toSet());
            if (existingChatEmails.equals(newChatEmails)) {
                throw new ChatAlreadyExists("Chat em Duplicidade");
            }
        });
    }

    private UserEntity findUserByEmail(String email) {
        Optional<UserEntity> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return user.get();
        }
        throw new EntityNotFoundException("Usuário não Encontrado");
    }

    private ChatEntity findChatById(String id) {
        Optional<ChatEntity> chat = chatRepository.findById(id);
        if (chat.isPresent()) {
            return chat.get();
        }
        throw new EntityNotFoundException("Chat não Encontrado");
    }

}
