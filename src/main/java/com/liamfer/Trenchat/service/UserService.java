package com.liamfer.Trenchat.service;

import com.liamfer.Trenchat.dto.cloudinary.CloudinaryPictureResponse;
import com.liamfer.Trenchat.dto.user.SearchedUserDTO;
import com.liamfer.Trenchat.entity.UserEntity;
import com.liamfer.Trenchat.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final CloudinaryService cloudinaryService;

    public UserService(UserRepository userRepository, ModelMapper modelMapper, CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.cloudinaryService = cloudinaryService;
    }

    public List<SearchedUserDTO> searchUsers(String email, UserDetails user){
        // Retorno só 10 Usuários na Pesquisa
        List<UserEntity> users = userRepository.findByEmailContainingIgnoreCase(email, PageRequest.of(0,10))
                .getContent()
                .stream()
                .filter(u -> !u.getEmail().equals(user.getUsername()))
                .toList();
        return users.stream().map(usr -> modelMapper.map(usr, SearchedUserDTO.class)).toList();
    }

    public CloudinaryPictureResponse uploadUserPicture(MultipartFile image,UserDetails userDetails){
        UserEntity user = findUserByEmail(userDetails.getUsername());
        String picture = cloudinaryService.addImage(image,user.getId());
        user.setPicture(picture);
        userRepository.save(user);
        return new CloudinaryPictureResponse(picture);
    }

    private UserEntity findUserByEmail(String email){
        Optional<UserEntity> user = userRepository.findByEmail(email);
        if(user.isPresent()){
            return user.get();
        }
        throw new EntityNotFoundException("Usuário não Encontrado");
    }
}
