package com.gaurav.chat_app_backend.services;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class RagChatService {

    private final ChatClient chatClient;

    public RagChatService(ChatClient.Builder chatClientBuilder,
                          VectorStore vectorStore,
                          ChatMemory chatMemory) {

        // 1. Build the RAG Advisor
        Advisor ragAdvisor = RetrievalAugmentationAdvisor.builder()
                .documentRetriever(VectorStoreDocumentRetriever.builder()
                        .similarityThreshold(0.50)
                        .vectorStore(vectorStore)
                        .build())
                .build();

        // 2. Configure the ChatClient with BOTH advisors as defaults
        this.chatClient = chatClientBuilder
                .defaultAdvisors(
                        // Advisor 1: Retrieves context from MongoDB Atlas
                        ragAdvisor,
                        // Advisor 2: Remembers the chat history (Updated to use the Builder)
                        MessageChatMemoryAdvisor.builder(chatMemory).build()
                )
                .build();
    }

    public String generateReply(String roomId, String userMessage) {
        return this.chatClient.prompt()
                .user(userMessage)
                // Use the exact static key for conversation binding
                .advisors(advisorSpec -> advisorSpec.param("chat_memory_conversation_id", roomId))
                .call()
                .content();
    }
}