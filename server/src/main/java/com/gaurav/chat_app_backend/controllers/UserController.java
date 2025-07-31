package com.gaurav.chat_app_backend.controllers;

import com.gaurav.chat_app_backend.payload.AvatarResponse;
import com.gaurav.chat_app_backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    Map<String, List<String>> avatarCache =new HashMap<>();

    @PostMapping("/setAvatar/{selectedAvatar}")
    public ResponseEntity<?> setAvatar(@PathVariable String selectedAvatar) {
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        try {
            AvatarResponse avatarResponse = userService.setAvatar(auth.getName(), selectedAvatar);
            return ResponseEntity.ok(avatarResponse);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Failed to set avatar: " + e.getMessage());
        }
    }

    @GetMapping("/getAvatars")
    public ResponseEntity<?> getAvatar() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        if( avatarCache.containsKey(auth.getName())) {
            return ResponseEntity.ok(avatarCache.get(auth.getName()));
        }
        List<String> avatars = List.of(
                "https://api.dicebear.com/7.x/adventurer/svg?seed="+(int)(Math.random() * 1000),
                "https://api.dicebear.com/7.x/adventurer/svg?seed="+(int)(Math.random() * 1000),
                "https://api.dicebear.com/7.x/adventurer/svg?seed="+(int)(Math.random() * 1000),
                "https://api.dicebear.com/7.x/adventurer/svg?seed="+(int)(Math.random() * 1000)
        );
        avatarCache.put(auth.getName(), avatars);
        return ResponseEntity.ok(avatars);
    }

    @GetMapping("/searchFriend")
    public ResponseEntity<?> searchFriend(@RequestParam String query) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String currentUsername = auth.getName();
        return ResponseEntity.ok(userService.searchFriend(currentUsername, query));
    }
    @PostMapping("/uploadAvatar")
    public ResponseEntity test(@RequestBody String t){
        return ResponseEntity.ok("test");
    }

    @PostMapping("/addFriend/{friendUsername}")
    public ResponseEntity<?> addFriend(@PathVariable String friendUsername) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String currentUsername = auth.getName();
        userService.addFriend(currentUsername, friendUsername);

        return ResponseEntity.ok("Friend " + friendUsername + " added successfully");
    }

    @PostMapping("/removeFriend")
    public ResponseEntity<?> removeFriend(@Valid @RequestBody String friendUsername) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String currentUsername = auth.getName(); // Assuming the friend username is passed in the request body

        userService.removeFriend(currentUsername, friendUsername);

        return ResponseEntity.ok("Friend " + friendUsername + " removed successfully");
    }

    @GetMapping("/getFriends")
    public ResponseEntity<?> getFriends() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String currentUsername = auth.getName();
        return ResponseEntity.ok(userService.getFriends(currentUsername));
    }

}
