package com.liamfer.Trenchat.controller;

import com.liamfer.Trenchat.dto.chat.ChatMessage;
import com.liamfer.Trenchat.dto.chat.CreateChatDTO;
import com.liamfer.Trenchat.dto.chat.CreatedChatDTO;
import com.liamfer.Trenchat.entity.ChatEntity;
import com.liamfer.Trenchat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

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
    public void sendToRoom(ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/" + message.room(), message);
    }

    @MessageMapping("/notifications")
    public void sendNotification(ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/" + message.room(), message);
    }

    // --- REST endpoints ---
    @PostMapping("/chat")
    public ResponseEntity<CreatedChatDTO> createChat(@RequestBody @Valid CreateChatDTO createChatDTO, @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.createChat(createChatDTO,user));
    }
}