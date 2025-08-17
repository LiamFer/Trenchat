package com.liamfer.Trenchat.service;

import com.liamfer.Trenchat.dto.user.CreateUserDTO;
import com.liamfer.Trenchat.dto.user.LoginUserDTO;
import com.liamfer.Trenchat.dto.user.UserLoginResponseDTO;
import com.liamfer.Trenchat.entity.UserEntity;
import com.liamfer.Trenchat.enums.UserRole;
import com.liamfer.Trenchat.repository.UserRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private JWTService jwtService;
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public void registerUser(CreateUserDTO createUserDTO){
        this.checkIfEmailIsAvailable(createUserDTO.email());

        UserEntity user = new UserEntity();
        String hashedPassword = passwordEncoder.encode(createUserDTO.password());
        user.setName(createUserDTO.name());
        user.setEmail(createUserDTO.email());
        user.setPassword(hashedPassword);
        user.setRole(UserRole.STANDARD);

        userRepository.save(user);
    }

    public UserLoginResponseDTO login(LoginUserDTO loginUserDTO){
        var credentials = new UsernamePasswordAuthenticationToken(loginUserDTO.email(),loginUserDTO.password());
        authenticationManager.authenticate(credentials);
        UserEntity user = findUserByEmail(loginUserDTO.email());
        return new UserLoginResponseDTO(user.getId(),user.getName(),user.getEmail(),user.getPicture());
    }

    public String generateToken(LoginUserDTO loginUserDTO){
        var credentials = new UsernamePasswordAuthenticationToken(loginUserDTO.email(),loginUserDTO.password());
        authenticationManager.authenticate(credentials);
        return jwtService.generateToken(loginUserDTO.email());
    }

    public UserLoginResponseDTO authenticateMe(String token){
        String email = jwtService.validateToken(token);
        UserEntity user = findUserByEmail(email);
        return new UserLoginResponseDTO(user.getId(),user.getName(),user.getEmail(),user.getPicture());
    }

    private void checkIfEmailIsAvailable(String email){
        Optional<UserEntity> user = userRepository.findByEmail(email);
        if(user.isPresent()){
            throw new EntityExistsException("Este endereço de e-mail já está sendo utilizado");
        }
    }

    private UserEntity findUserByEmail(String email){
        Optional<UserEntity> user = userRepository.findByEmail(email);
        if(user.isPresent()){
            return user.get();
        }
        throw new EntityNotFoundException("Usuário não Encontrado");
    }

}
