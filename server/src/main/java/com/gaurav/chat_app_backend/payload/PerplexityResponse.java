package com.gaurav.chat_app_backend.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PerplexityResponse {
    private String id;
    private String model;
    private long created;
    private Usage usage;
    private List<String> citations;
    private List<SearchResult> search_results;
    private String object;
    private List<Choice> choices;

    public static class Usage {
        private int prompt_tokens;
        private int completion_tokens;
        private int total_tokens;
        private String search_context_size;

        public Usage(int prompt_tokens, int completion_tokens, int total_tokens, String search_context_size) {
            this.prompt_tokens = prompt_tokens;
            this.completion_tokens = completion_tokens;
            this.total_tokens = total_tokens;
            this.search_context_size = search_context_size;
        }
    }

    public static class SearchResult {
        private String title;
        private String url;
        private String date;
        private String last_updated;

        public SearchResult(String title, String url, String date, String last_updated) {
            this.title = title;
            this.url = url;
            this.date = date;
            this.last_updated = last_updated;
        }
    }

    public static class Choice {
        private int index;
        private String finish_reason;
        private Message message;
        private Delta delta;

        public Choice(int index, String finish_reason, Message message, Delta delta) {
            this.index = index;
            this.finish_reason = finish_reason;
            this.message = message;
            this.delta = delta;
        }
    }

    public static class Message {
        private String role;
        private String content;

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

    public static class Delta {
        private String role;
        private String content;

        public Delta(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

}
