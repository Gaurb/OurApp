package com.gaurav.chat_app_backend.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AvatarResponse {
    private String avatarUrl;
    private boolean isAvatarSet;
}
