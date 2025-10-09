package com.liamfer.Trenchat.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatUpdateDTO {
    private String name;
    private List<String> membersAdded;
    private List<String> membersRemoved;
}
