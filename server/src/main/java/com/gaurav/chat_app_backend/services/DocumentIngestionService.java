package com.gaurav.chat_app_backend.services;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.TextReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class DocumentIngestionService {

    private final VectorStore vectorStore;

    @Value("classpath:/data/knowledge-base.txt")
    private Resource knowledgeBaseResource;

    public DocumentIngestionService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void ingestDocuments() {
        try {
            System.out.println("--- STARTING INGESTION PROCESS ---");

            // 1. Check if file exists
            if (!knowledgeBaseResource.exists()) {
                System.err.println("ERROR: File not found at classpath:/data/knowledge-base.txt");
                return;
            }

            // 2. Read the file MANUALLY to bypass Spring AI TextReader bugs
            System.out.println("File found! Reading content manually...");
            String rawText = StreamUtils.copyToString(knowledgeBaseResource.getInputStream(), StandardCharsets.UTF_8);

            if (rawText.trim().isEmpty()) {
                System.err.println("ERROR: The file is completely empty.");
                return;
            }

            // 3. Create the Document manually
            Document baseDocument = new Document(rawText, Map.of("source", "knowledge-base.txt"));

            // 4. Split the text into tokens
            System.out.println("Text read successfully. Splitting into chunks...");
            TokenTextSplitter textSplitter = new TokenTextSplitter();
            List<Document> splitDocuments = textSplitter.apply(List.of(baseDocument));

            // 5. Send to Vector Store (Google GenAI Embeddings -> MongoDB Atlas)
            System.out.println("Sending " + splitDocuments.size() + " chunks to Gemini & MongoDB Atlas...");
            vectorStore.add(splitDocuments);

            System.out.println("--- SUCCESS! INGESTION COMPLETE ---");

        } catch (Exception e) {
            System.err.println("--- INGESTION FAILED ---");
            e.printStackTrace();
        }
    }
}