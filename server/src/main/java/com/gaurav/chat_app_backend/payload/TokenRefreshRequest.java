package com.gaurav.chat_app_backend.payload;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRefreshRequest {
    @NotNull(message = "Refresh token cannot be null")
    private String refreshToken;
}
