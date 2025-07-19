package com.gaurav.chat_app_backend.exception;


public class CustomBusinessException extends RuntimeException {
    public CustomBusinessException(String message) {
        super(message);
    }
}

