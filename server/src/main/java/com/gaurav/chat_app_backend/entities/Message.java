package com.gaurav.chat_app_backend.entities;

import com.mongodb.lang.NonNull;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Document(collection = "messages")
public class Message {
    @Id
    private ObjectId id;
    @NonNull
    private  String sender;
    @NonNull
    private String receiver;
    private String content;
    private LocalDateTime timestamp;
}
