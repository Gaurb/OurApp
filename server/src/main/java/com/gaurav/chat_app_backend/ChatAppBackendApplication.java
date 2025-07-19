package com.gaurav.chat_app_backend;


import com.gaurav.chat_app_backend.constants.AppConstants;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@SpringBootApplication
@EnableWebMvc
@CrossOrigin(
		origins = AppConstants.FRONT_END_BASE_URL,
		allowCredentials = "true"
)
public class ChatAppBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChatAppBackendApplication.class, args);
	}

}
