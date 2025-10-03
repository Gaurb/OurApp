package com.gaurav.chat_app_backend.services;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiCoPilotService {
    private final String apiKey;
    private final String modelName;

    public AiCoPilotService(@Value("${google.api.key}") String apiKey,
                            @Value("${google.gemini.model}") String modelName) {
        this.apiKey = apiKey;
        this.modelName = modelName;
    }

    public List<String> getMagicReplies(String conversationHistory) {
        try (Client client = Client.builder().apiKey(apiKey).build()) {

            // Construct a very specific prompt for the AI
            String prompt = "You are a helpful chat assistant. Given the following conversation, suggest three short, distinct, and natural-sounding replies to the last message. "
                    + "Provide only the three replies, separated by a semicolon ';'. Do not add any other text or formatting.\n\n"
                    + "Conversation:\n" + conversationHistory;

            GenerateContentResponse response = client.models.generateContent(modelName, prompt, null);
            String rawResponse = response.text();

            // The response will be a single string like "Okay!;Got it, thanks!;I'll check it out."
            // We split it into a list.
            assert rawResponse != null;
            return Arrays.stream(rawResponse.split(";"))
                    .map(String::trim)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            // Log the error properly in a real application
            System.err.println("Error generating replies: " + e.getMessage());
            return List.of(); // Return an empty list on failure
        }
    }


}
