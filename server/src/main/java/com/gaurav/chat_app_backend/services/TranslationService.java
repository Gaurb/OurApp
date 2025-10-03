//package com.gaurav.chat_app_backend.services;
//
//import com.google.cloud.translate.v3.LocationName;
//import com.google.cloud.translate.v3.TranslateTextRequest;
//import com.google.cloud.translate.v3.TranslateTextResponse;
//import com.google.cloud.translate.v3.TranslationServiceClient;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//
//import java.io.IOException;
//
//@Service
//public class TranslationService {
//    // You should configure your Google Cloud Project ID in application.properties
//
//    private final String projectId;
//
//    public TranslationService( @Value("${google.cloud.project-id}")String projectId) {
//        this.projectId = projectId;
//    }
//
//    public String translateText(String text, String sourceLang, String targetLang) {
//        // If the target language is the same as the source, no need to translate
//        if (sourceLang.equals(targetLang)) {
//            return text;
//        }
//
//        try (TranslationServiceClient client = TranslationServiceClient.create()) {
//            LocationName parent = LocationName.of(projectId, "global");
//
//            TranslateTextRequest request =
//                    TranslateTextRequest.newBuilder()
//                            .setParent(parent.toString())
//                            .setMimeType("text/plain")
//                            .setSourceLanguageCode(sourceLang)
//                            .setTargetLanguageCode(targetLang)
//                            .addContents(text)
//                            .build();
//
//            TranslateTextResponse response = client.translateText(request);
//
//            // Return the first translation
//            return response.getTranslations(0).getTranslatedText();
//
//        } catch (IOException e) {
//            // Handle exceptions: API down, auth issues, etc.
//            // For now, we'll return the original text as a fallback.
//            System.err.println("Error translating text: " + e.getMessage());
//            return text + " (translation failed)";
//        }
//    }
//
//
//    public static void main(String[] args) {
//        TranslationService service = new TranslationService("evocative-nexus-466904-a5");
//        String translatedText = service.translateText("Hello, world!", "en", "es");
//        System.out.println(translatedText); // Should print "Hola, mundo!"
//    }
//}
