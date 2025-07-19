package com.gaurav.chat_app_backend.controllers;
import com.gaurav.chat_app_backend.entities.Message;
import com.gaurav.chat_app_backend.exception.CustomBusinessException;
import com.gaurav.chat_app_backend.payload.MessageRequest;
import com.gaurav.chat_app_backend.repo.MessageRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

   private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public Message sendMessage(@RequestBody Message request) {
        if(request.getContent() == null) {
            throw new RuntimeException("Sender and content cannot be null");
        }
        request.setTimestamp(LocalDateTime.now());

        return messageRepository.save(request);
    }
    @MessageMapping("/private-message")
    public void sendPrivateMessage(@Valid @Payload MessageRequest privateMessage) {
        logger.info("Received private message: {}", privateMessage);
        if (privateMessage.getSender() == null || privateMessage.getReceiver() == null || privateMessage.getContent() == null) {
            throw new CustomBusinessException("Sender, receiver and content cannot be null");
        }
        Message message = new Message();
        message.setSender(privateMessage.getSender());
        message.setReceiver(privateMessage.getReceiver());
        message.setContent(privateMessage.getContent());
        messageRepository.save(message);
        // Send to recipient
        String recipientDestination = "/user/" + privateMessage.getReceiver() + "/queue/private";
        logger.info("Sending to recipient at: {}", recipientDestination);
        messagingTemplate.convertAndSendToUser(
                privateMessage.getSender(),
                "/queue/private",
                privateMessage
        );

        // Send back to sender
        String senderDestination = "/user/" + privateMessage.getSender() + "/queue/private";
        logger.info("Sending back to sender at: {}", senderDestination);
        messagingTemplate.convertAndSendToUser(
                privateMessage.getReceiver(),
                "/queue/private",
                privateMessage
        );
    }

    @GetMapping("/messages/{sender}/{receiver}")
    public ResponseEntity<List<Message>> getChatHistory(
            @PathVariable String sender,
            @PathVariable String receiver,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<Message> messages = messageRepository.findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
            sender, receiver, sender, receiver);
        
        // Simple pagination
        int start = page * size;
        int end = Math.min(start + size, messages.size());
        
        if (start >= messages.size()) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        
        List<Message> paginatedMessages = messages.subList(start, end);
        return ResponseEntity.ok(paginatedMessages);
    }





}
