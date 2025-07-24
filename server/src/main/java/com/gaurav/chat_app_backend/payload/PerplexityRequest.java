package com.gaurav.chat_app_backend.payload;

import java.util.List;

public class PerplexityRequest {
    private String model;
    private List<Message> messages;
    private int max_tokens;
    private double temperature;

    public PerplexityRequest(String model, List<Message> messages, int max_tokens, double temperature) {
        this.model = model;
        this.messages = messages;
        this.max_tokens = max_tokens;
        this.temperature = temperature;
    }

    // Getters and Setters (optional)

    public static class Message {
        private String role;
        private String content;

        // Constructor
        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }
}
