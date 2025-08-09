package com.liamfer.Trenchat.controller;

import com.liamfer.Trenchat.dto.api.APIMessage;
import com.liamfer.Trenchat.dto.user.CreateUserDTO;
import com.liamfer.Trenchat.dto.user.GeneratedTokenResponse;
import com.liamfer.Trenchat.dto.user.LoginUserDTO;
import com.liamfer.Trenchat.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<APIMessage<String>> register (@RequestBody @Valid CreateUserDTO createUserDTO){
        authService.registerUser(createUserDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(new APIMessage<>(HttpStatus.CREATED.value(), "Usuário Criado com Sucesso!"));
    }

    @PostMapping("/login")
    public ResponseEntity<GeneratedTokenResponse> login (@RequestBody @Valid LoginUserDTO loginUserDTO){
        String token = authService.login(loginUserDTO);
        return ResponseEntity.ok(new GeneratedTokenResponse(token));
    }
}
