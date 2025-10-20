package com.liamfer.Trenchat.dto.chat;

import com.liamfer.Trenchat.dto.user.UserDTO;
import com.liamfer.Trenchat.entity.UserEntity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatConfigDTO {
    private String id;
    private String name;
    private Boolean isGroup;
    private UserDTO owner;
    private Set<UserDTO> participants;
}
