package com.liamfer.Trenchat.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {
    public String type;
    public String text;
    public String user;
    public String picture;
    public String time;
}
