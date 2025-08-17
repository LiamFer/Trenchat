package com.liamfer.Trenchat.controller;

import com.liamfer.Trenchat.dto.user.SearchedUserDTO;
import com.liamfer.Trenchat.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchedUserDTO>> searchUsers(@RequestParam(name = "email", defaultValue = "") String email,
                                                             @AuthenticationPrincipal UserDetails user){
        return ResponseEntity.ok(userService.searchUsers(email,user));
    }
}
