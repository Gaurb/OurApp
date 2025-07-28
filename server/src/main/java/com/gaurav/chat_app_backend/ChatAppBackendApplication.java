package com.gaurav.chat_app_backend;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@SpringBootApplication
@EnableWebMvc
public class ChatAppBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatAppBackendApplication.class, args);
    }

}
