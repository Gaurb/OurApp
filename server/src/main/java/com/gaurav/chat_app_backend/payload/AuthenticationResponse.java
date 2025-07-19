package com.gaurav.chat_app_backend.payload;

import com.gaurav.chat_app_backend.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationResponse {
    private String token;
    private String refreshToken;
    private UserDTO user;
}
