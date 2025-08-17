package com.liamfer.Trenchat.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchedUserDTO {
    public String email;
    public String name;
    public String picture;
}
