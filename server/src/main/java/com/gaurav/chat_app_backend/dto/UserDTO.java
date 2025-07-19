package com.gaurav.chat_app_backend.dto;

public record UserDTO(String username, String email,String avatarUrl, String role, boolean isAvatarSet) {}
