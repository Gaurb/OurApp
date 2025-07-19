package com.gaurav.chat_app_backend.payload;

import com.gaurav.chat_app_backend.entities.User;
import com.mongodb.lang.NonNull;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MessageRequest {
    private  String sender;
    @NotNull(message = "Receiver cannot be null")
    private String receiver;
    @NotNull(message = "Content cannot be null")
    private String content;
}
