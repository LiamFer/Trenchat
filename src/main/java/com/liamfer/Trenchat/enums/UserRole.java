package com.liamfer.Trenchat.enums;

public enum UserRole {
    STANDARD("ROLE_STANDARD"),
    ADMIN("ROLE_ADMIN");
    private String role;
    UserRole(String role){
        this.role = role;
    }
    public String getRole(){return this.role;}
}