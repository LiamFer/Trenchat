package com.liamfer.Trenchat.exceptions;

public class ChatAlreadyExists extends RuntimeException {
    public ChatAlreadyExists(String message) {
        super(message);
    }
}
