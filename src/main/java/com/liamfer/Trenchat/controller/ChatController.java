package com.liamfer.Trenchat.controller;

import com.liamfer.Trenchat.dto.chat.*;
import com.liamfer.Trenchat.dto.cloudinary.CloudinaryPictureResponse;
import com.liamfer.Trenchat.dto.user.UserDTO;
import com.liamfer.Trenchat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    // --- WebSocket ---
    @MessageMapping("/chatroom")
    public void sendToRoom(ChatMessage message, Principal principal) {
        String email = principal.getName();
        chatService.sendMessage(message,email);
    }

    @MessageMapping("/notifications")
    public void sendNotification(ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/" + message.room(), message);
    }

    // --- REST endpoints ---
    @PostMapping("/chat")
    public ResponseEntity<ChatDTO> createChat(@RequestBody @Valid CreateChatDTO createChatDTO, @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.createChat(createChatDTO,user));
    }

    @PostMapping("/chat/{chatId}")
    public ResponseEntity<ChatConfigDTO> createChat(@PathVariable String chatId,@RequestBody @Valid ChatUpdateDTO chatUpdateDTO, @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.OK).body(chatService.updateChat(chatId,chatUpdateDTO,user));
    }

    @DeleteMapping("/chat/{chatId}")
    public ResponseEntity<Void> deleteChat(@PathVariable String chatId, @AuthenticationPrincipal UserDetails user) {
        chatService.deleteChat(chatId,user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/chat")
    public ResponseEntity<List<ChatDTO>> fetchChats(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(chatService.fetchUserChats(user));
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<ChatConfigDTO> getChatData(@PathVariable String chatId) {
        return ResponseEntity.ok(chatService.getChatData(chatId));
    }

    @GetMapping("/messages/{chatId}")
    public ResponseEntity<Page<MessageDTO>> fetchChatMessages(@PathVariable String chatId,
                                                              @PageableDefault(sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable,
                                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(chatService.getChatMessages(chatId,pageable,user));
    }

    @PostMapping("/messages/seen/{messageId}")
    public ResponseEntity<Void> setMessageAsSeen(@PathVariable Long messageId, @AuthenticationPrincipal UserDetails user) {
        chatService.setMessageAsSeen(messageId,user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("chat/{chatId}/messages/seen")
    public ResponseEntity<Void> setChatMessagesAsSeen(@PathVariable String chatId, @AuthenticationPrincipal UserDetails user) {
        chatService.markAllMessagesAsSeen(chatId,user);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/chat/image", consumes = "multipart/form-data")
    public ResponseEntity<CloudinaryPictureResponse> uploadImage(@RequestPart("image") MultipartFile image,
                                                                       @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.uploadImage(image,user));
    }
}