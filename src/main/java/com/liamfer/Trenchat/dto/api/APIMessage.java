package com.liamfer.Trenchat.dto.api;

public record APIMessage <T>(int code,T message) {
}
