package com.gaurav.chat_app_backend.payload;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    @JsonProperty("username")
    @NotNull(message = "Username cannot be null")
    private String username;
    @JsonProperty("email")
    @NotNull(message = "Email cannot be null")
    private String email;
    @JsonProperty("password")
    @NotNull(message = "Password cannot be null")
    private String password;
}
