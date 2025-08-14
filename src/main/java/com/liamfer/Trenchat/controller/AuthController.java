package com.liamfer.Trenchat.controller;

import com.liamfer.Trenchat.dto.api.APIMessage;
import com.liamfer.Trenchat.dto.user.CreateUserDTO;
import com.liamfer.Trenchat.dto.user.GeneratedTokenResponse;
import com.liamfer.Trenchat.dto.user.LoginUserDTO;
import com.liamfer.Trenchat.dto.user.UserLoginResponseDTO;
import com.liamfer.Trenchat.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<UserLoginResponseDTO> login (@RequestBody @Valid LoginUserDTO loginUserDTO){
        UserLoginResponseDTO userResponse = authService.login(loginUserDTO);
        String token = authService.generateToken(loginUserDTO);
        ResponseCookie jwtCookie = ResponseCookie.from("jwt-token", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Strict")
                .maxAge(24 * 60 * 60) // 1 dia
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(userResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserLoginResponseDTO> authMe(HttpServletRequest request) {
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt-token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        return ResponseEntity.ok(authService.authenticateMe(token));
    }


}
