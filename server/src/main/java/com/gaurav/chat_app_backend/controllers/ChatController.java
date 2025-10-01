package com.gaurav.chat_app_backend.controllers;

import com.gaurav.chat_app_backend.entities.Message;
import com.gaurav.chat_app_backend.exception.CustomBusinessException;
import com.gaurav.chat_app_backend.payload.MessageRequest;
import com.gaurav.chat_app_backend.payload.TypingStatusRequest;
import com.gaurav.chat_app_backend.payload.TypingStatusResponse;
import com.gaurav.chat_app_backend.repo.MessageRepository;
import com.gaurav.chat_app_backend.services.AiCoPilotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AiCoPilotService aiCoPilotService;

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public Message sendMessage(@RequestBody Message request) {
        if (request.getContent() == null) {
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
        message.setTimestamp(LocalDateTime.now());
        messageRepository.save(message);
        // Generate and send AI suggestions asynchronously
        generateAndSendSuggestions(message);
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

    @MessageMapping("/typing-status")
    public void handleTypingStatus(@Valid @Payload TypingStatusRequest typingStatusRequest) {
        logger.info("Received typing status: {}", typingStatusRequest);

        if (typingStatusRequest.getSender() == null || typingStatusRequest.getReceiver() == null) {
            throw new CustomBusinessException("Sender and receiver cannot be null");
        }

        // Create response with timestamp
        TypingStatusResponse response = new TypingStatusResponse(
                typingStatusRequest.getSender(),
                typingStatusRequest.getReceiver(),
                typingStatusRequest.getIsTyping()
        );

        // Send typing status to the receiver
        messagingTemplate.convertAndSendToUser(
                typingStatusRequest.getReceiver(),
                "/queue/typing",
                response
        );
    }

    @MessageMapping("/stop-typing")
    public void handleStopTyping(@Valid @Payload TypingStatusRequest typingStatusRequest) {
        logger.info("Received stop typing: {}", typingStatusRequest);

        if (typingStatusRequest.getSender() == null || typingStatusRequest.getReceiver() == null) {
            throw new CustomBusinessException("Sender and receiver cannot be null");
        }

        // Create response for stop typing
        TypingStatusResponse response = new TypingStatusResponse(
                typingStatusRequest.getSender(),
                typingStatusRequest.getReceiver(),
                false
        );

        // Send stop typing status to the receiver
        messagingTemplate.convertAndSendToUser(
                typingStatusRequest.getReceiver(),
                "/queue/typing",
                response
        );
    }

    @Async // This makes the method run in a separate thread
    public void generateAndSendSuggestions(Message chatMessage) {
        // For simplicity, we'll just use the message content as history.
        // In a real app, you'd fetch the last 5-10 messages from your database.
        List<Message> bySenderAndReceiverOrderByTimestampAsc = messageRepository.findBySenderAndReceiverOrderByTimestampAsc(chatMessage.getSender(), chatMessage.getReceiver(), Pageable.ofSize(5));

        String conversationHistory = bySenderAndReceiverOrderByTimestampAsc.stream()
                .map(msg -> msg.getSender() + ": " + msg.getContent())
                .reduce("", (acc, msg) -> acc + "\n" + msg);

        List<String> replies = aiCoPilotService.getMagicReplies(conversationHistory);

        logger.info("Generated AI replies: {}", replies);

        if (!replies.isEmpty()) {
            // Send the suggestions ONLY to the recipient of the message
            String recipientUsername = chatMessage.getReceiver(); // Assuming your ChatMessage has a recipient
            messagingTemplate.convertAndSendToUser(
                    recipientUsername,
                    "/queue/suggestions", // A private queue for the user
                    replies // The payload (a list of strings)
            );
        }
    }
}