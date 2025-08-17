package com.liamfer.Trenchat.service;

import com.liamfer.Trenchat.dto.user.SearchedUserDTO;
import com.liamfer.Trenchat.entity.UserEntity;
import com.liamfer.Trenchat.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public UserService(UserRepository userRepository, ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    public List<SearchedUserDTO> searchUsers(String email, UserDetails user){
        // Retorno só 10 Usuários na Pesquisa
        List<UserEntity> users = userRepository.findByEmailContainingIgnoreCase(email, PageRequest.of(0,10)).getContent();
        users.removeIf(u -> u.getEmail().equals(user.getUsername()));
        return users.stream().map(u -> modelMapper.map(u, SearchedUserDTO.class)).toList();
    }
}
