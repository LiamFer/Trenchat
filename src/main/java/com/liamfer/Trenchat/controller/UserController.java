package com.liamfer.Trenchat.controller;

import com.liamfer.Trenchat.dto.cloudinary.CloudinaryPictureResponse;
import com.liamfer.Trenchat.dto.user.UserDTO;
import com.liamfer.Trenchat.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Controller
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam(name = "email", defaultValue = "") String email,
                                                     @AuthenticationPrincipal UserDetails user){
        return ResponseEntity.ok(userService.searchUsers(email,user));
    }

    @PostMapping(value = "/picture", consumes = "multipart/form-data")
    public ResponseEntity<CloudinaryPictureResponse> uploadUserPicture(@RequestPart("image") MultipartFile image,
                                                                       @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.uploadUserPicture(image,user));
    }
}
