package com.gaurav.chat_app_backend.controllers;

import com.gaurav.chat_app_backend.entities.Message;
import com.gaurav.chat_app_backend.entities.MessageType;
import com.gaurav.chat_app_backend.exception.CustomBusinessException;
import com.gaurav.chat_app_backend.payload.*;
import com.gaurav.chat_app_backend.repo.MessageRepository;
import com.gaurav.chat_app_backend.services.AiCoPilotService;
import com.gaurav.chat_app_backend.services.RagChatService;
import com.gaurav.chat_app_backend.services.RoomService;
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
    private final RoomService roomService;
    private final RagChatService ragService;

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
        message.setMessageType(MessageType.PRIVATE);
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

    @MessageMapping("/group-message")
    public void sendGroupMessage(@Valid @Payload GroupMessageRequest groupMessage) {
        logger.info("Received group message: {}", groupMessage);
        
        if (groupMessage.getSender() == null || groupMessage.getRoomName() == null || groupMessage.getContent() == null) {
            throw new CustomBusinessException("Sender, room name and content cannot be null");
        }

        try {
            // Verify user is a member of the room
            roomService.getRoomByName(groupMessage.getRoomName(), groupMessage.getSender());
            
            // Save the message
            Message message = Message.builder()
                    .sender(groupMessage.getSender())
                    .roomName(groupMessage.getRoomName())
                    .content(groupMessage.getContent())
                    .messageType(MessageType.GROUP)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            Message savedMessage = messageRepository.save(message);
            
            // Create response
            GroupMessageResponse response = GroupMessageResponse.builder()
                    .id(savedMessage.getId().toString())
                    .sender(savedMessage.getSender())
                    .roomName(savedMessage.getRoomName())
                    .content(savedMessage.getContent())
                    .timestamp(savedMessage.getTimestamp())
                    .build();

            if (groupMessage.getContent().contains("@bot")) {
                generateAndSendRagResponse(groupMessage);
            }
            
            // Broadcast to all room members
            logger.info("Broadcasting group message to room: {}", groupMessage.getRoomName());
            messagingTemplate.convertAndSend("/topic/room/" + groupMessage.getRoomName(), response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Error sending group message: {}", e.getMessage());
            throw new CustomBusinessException(e.getMessage());
        }
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

    @MessageMapping("/group-typing")
    public void handleGroupTyping(@Valid @Payload GroupTypingStatusRequest typingStatusRequest) {
        logger.info("Received group typing status: {}", typingStatusRequest);

        if (typingStatusRequest.getSender() == null || typingStatusRequest.getRoomName() == null) {
            throw new CustomBusinessException("Sender and room name cannot be null");
        }

        // Broadcast typing status to all members in the room
        messagingTemplate.convertAndSend(
                "/topic/room/" + typingStatusRequest.getRoomName() + "/typing",
                typingStatusRequest
        );
    }

    @GetMapping("/group-messages/{roomName}")
    public ResponseEntity<List<GroupMessageResponse>> getGroupMessages(
            @PathVariable String roomName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        logger.info("Fetching group messages for room: {}", roomName);
        
        List<Message> messages = messageRepository.findByRoomNameAndMessageTypeOrderByTimestampAsc(
                roomName, MessageType.GROUP);
        
        // Simple pagination
        int start = page * size;
        int end = Math.min(start + size, messages.size());
        
        if (start >= messages.size()) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        
        List<Message> paginatedMessages = messages.subList(start, end);
        
        // Convert to response DTOs
        List<GroupMessageResponse> responses = paginatedMessages.stream()
                .map(msg -> GroupMessageResponse.builder()
                        .id(msg.getId().toString())
                        .sender(msg.getSender())
                        .roomName(msg.getRoomName())
                        .content(msg.getContent())
                        .timestamp(msg.getTimestamp())
                        .build())
                .toList();
        
        return ResponseEntity.ok(responses);
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


    @Async
    public void generateAndSendRagResponse(GroupMessageRequest groupMessage) {
        try {
            // 1. Clean the prompt so the bot just reads the question
            String cleanPrompt = groupMessage.getContent().replace("@bot", "").trim();

            // 2. Get AI Response using your ConversationRagService
            // We pass the roomName as the session ID so it remembers context per room
            logger.info("Generating RAG response for room: {}", groupMessage.getRoomName());
            String aiResponse = ragService.generateReply(groupMessage.getRoomName(), cleanPrompt);

            // 3. Save the bot's reply to the database so it appears in chat history
            Message botMessage = Message.builder()
                    .sender("OurApp-Bot")
                    .roomName(groupMessage.getRoomName())
                    .content(aiResponse)
                    .messageType(MessageType.GROUP)
                    .timestamp(LocalDateTime.now())
                    .build();

            Message savedBotMessage = messageRepository.save(botMessage);

            // 4. Broadcast the bot's response to the room
            GroupMessageResponse response = GroupMessageResponse.builder()
                    .id(savedBotMessage.getId().toString())
                    .sender(savedBotMessage.getSender())
                    .roomName(savedBotMessage.getRoomName())
                    .content(savedBotMessage.getContent())
                    .timestamp(savedBotMessage.getTimestamp())
                    .build();

            messagingTemplate.convertAndSend("/topic/room/" + groupMessage.getRoomName(), response);
        } catch (Exception e) {
            logger.error("Failed to generate RAG response: {}", e.getMessage());
            // Optional: You could broadcast an error message back to the chat room here
        }
    }
}