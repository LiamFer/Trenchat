package com.liamfer.Trenchat.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginUserDTO(@NotBlank @Email String email,
                           @NotBlank @Size(min = 6,max = 12) String password) {
}
