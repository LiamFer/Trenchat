package com.liamfer.Trenchat.dto.chat;

public record ChatMessage(String room,
                          String sender,
                          String content,
                          String imageUrl,
                          String picture) {
}
