package com.gaurav.chat_app_backend.services;

import com.gaurav.chat_app_backend.dto.UserDTO;
import com.gaurav.chat_app_backend.entities.User;
import com.gaurav.chat_app_backend.payload.AvatarResponse;
import com.gaurav.chat_app_backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public AvatarResponse setAvatar(String username, String avatar) {

        if (avatar == null || avatar.isEmpty()) {
            throw new IllegalArgumentException("Avatar is empty");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setAvatarUrl(String.format("https://api.dicebear.com/7.x/adventurer/svg?seed=%s", avatar));
        user.setAvatarSet(true);
        User saved = userRepository.save(user);
        return AvatarResponse
                .builder()
                .avatarUrl(saved.getAvatarUrl())
                .isAvatarSet(saved.isAvatarSet())
                .build();
    }

    public void addFriend(String currentUsername, String friendUsername) {
        if (friendUsername == null || friendUsername.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Friend username cannot be empty");
        }
        if (currentUsername.equals(friendUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot add yourself as a friend");
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Current user not found"));
        User friendUser = userRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Friend user not found"));

        if (currentUser.getFriends() != null && currentUser.getFriends().stream().anyMatch(friend -> friend.getUsername().equals(friendUsername))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Friend already exists");
        }
        if (currentUser.getFriends() != null) {
            currentUser.getFriends().add(friendUser);
        } else {
            Set<User> friends = new HashSet<>();
            friends.add(friendUser);
            currentUser.setFriends(friends);
        }
        if (friendUser.getFriends() != null) {
            friendUser.getFriends().add(currentUser);
        } else {
            Set<User> friends = new HashSet<>();
            friends.add(currentUser);
            friendUser.setFriends(friends);
        }
        userRepository.save(currentUser);
        userRepository.save(friendUser);
    }

    public void removeFriend(String currentUsername, String friendUsername) {
        if (friendUsername == null || friendUsername.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Friend username cannot be empty");
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Current user not found"));
        User friendUser = userRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Friend user not found"));

        if (currentUser.getFriends() != null && !currentUser.getFriends().removeIf(friend -> friend.getUsername().equals(friendUsername))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Friend not found in current user's friends list");
        }
        friendUser.getFriends().removeIf(friend -> friend.getUsername().equals(currentUsername));
        userRepository.save(currentUser);
        userRepository.save(friendUser);
    }

    public Set<UserDTO> getFriends(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Current user not found"));
        if (currentUser.getFriends() == null || currentUser.getFriends().isEmpty()) {
            return null;
        }
        return
                currentUser.getFriends()
                        .stream()
                        .map(friend -> new UserDTO(
                                friend.getUsername(),
                                friend.getEmail(),
                                friend.getAvatarUrl(),
                                friend.getRole().toString(),
                                friend.isAvatarSet()))
                        .collect(Collectors.toSet()
                        );
    }

    public Set<UserDTO> searchFriend(String currentUsername, String searchUsername) {
        String regex = ".*" + searchUsername + ".*";
        return userRepository.findByUsernameRegexAndNotCurrent(currentUsername, regex)
                .stream()
                .map(friend -> new UserDTO(friend.getUsername(), friend.getEmail(), friend.getAvatarUrl(), friend.getRole().toString(), friend.isAvatarSet())
                )
                .collect(Collectors.toSet());
    }
}
