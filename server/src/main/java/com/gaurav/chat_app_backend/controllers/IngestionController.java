package com.gaurav.chat_app_backend.controllers;

import com.gaurav.chat_app_backend.services.DocumentIngestionService;
import org.springframework.ai.document.Document;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.ai.vectorstore.VectorStore;
import java.util.List;

@RestController
public class IngestionController {

    private final DocumentIngestionService ingestionService;
    private final VectorStore vectorStore; // <-- Inject the VectorStore directly for the test


    public IngestionController(DocumentIngestionService ingestionService, VectorStore vectorStore) {
         this.ingestionService = ingestionService;
        this.vectorStore = vectorStore;
    }

    // Your existing /ingest endpoint...

    // NEW TEST ENDPOINT
    @PostMapping("/api/admin/rag/ingest-test")
    public String triggerTestIngestion() {
        try {
            // Create one simple test document
           ingestionService.ingestDocuments();
            // Send it directly to Google for embedding and MongoDB for storage
//            vectorStore.add(List.of(testDoc));
            
            return "SUCCESS: Test document added to MongoDB Atlas!";
        } catch (Exception e) {
            e.printStackTrace(); // This will print the exact reason it fails to your console
            return "FAILED: Check your IDE console for the error.";
        }
    }
}