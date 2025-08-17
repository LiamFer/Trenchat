package com.liamfer.Trenchat.dto.chat;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateChatDTO(String name, @NotNull Boolean isGroup, @NotEmpty List<String> participantsEmails) {
}
