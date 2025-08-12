package com.liamfer.Trenchat.controller;

import com.liamfer.Trenchat.dto.chat.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/sendToRoom")
    public void sendToRoom(ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/" + message.room(), message);
    }
}