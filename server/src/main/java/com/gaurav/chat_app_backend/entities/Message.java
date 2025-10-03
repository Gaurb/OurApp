package com.gaurav.chat_app_backend.entities;

import com.mongodb.lang.NonNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Document(collection = "messages")
public class Message {
    @Id
    private ObjectId id;
    private String sender;
    private String receiver; // For private messages
    private String roomName; // For group messages
    private MessageType messageType; // PRIVATE or GROUP
    private String content;
    private LocalDateTime timestamp;
}
