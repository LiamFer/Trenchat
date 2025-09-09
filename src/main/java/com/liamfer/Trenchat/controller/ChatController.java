package com.liamfer.Trenchat.controller;

import com.liamfer.Trenchat.dto.chat.ChatMessage;
import com.liamfer.Trenchat.dto.chat.CreateChatDTO;
import com.liamfer.Trenchat.dto.chat.ChatDTO;
import com.liamfer.Trenchat.dto.chat.MessageDTO;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

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
        System.out.println(email);
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

    @GetMapping("/chat")
    public ResponseEntity<List<ChatDTO>> fetchChats(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(chatService.fetchUserChats(user));
    }

    @GetMapping("/messages/{chatId}")
    public ResponseEntity<Page<MessageDTO>> fetchChatMessages(@PathVariable String chatId,
                                                              @PageableDefault(sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable,
                                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(chatService.getChatMessages(chatId,pageable,user));
    }
}