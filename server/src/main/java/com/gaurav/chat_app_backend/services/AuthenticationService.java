package com.gaurav.chat_app_backend.services;

import com.gaurav.chat_app_backend.config.JwtService;
import com.gaurav.chat_app_backend.dto.UserDTO;
import com.gaurav.chat_app_backend.entities.Role;
import com.gaurav.chat_app_backend.entities.User;
import com.gaurav.chat_app_backend.exception.CustomBusinessException;
import com.gaurav.chat_app_backend.payload.AuthenticationRequest;
import com.gaurav.chat_app_backend.payload.AuthenticationResponse;
import com.gaurav.chat_app_backend.payload.RegisterRequest;
import com.gaurav.chat_app_backend.payload.TokenRefreshRequest;
import com.gaurav.chat_app_backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;



    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        var perplexingEmail = userRepository.findById(new ObjectId("687bd754e879154f366ef20d"))
                .orElseThrow(() -> new CustomBusinessException("Perplexing email user not found"));
        var user=User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .friends(Set.of(perplexingEmail))
                .role(Role.USER)

                .build();
        User saved = userRepository.save(user);
        var jwtToken=jwtService.generateToken(user);
        var refreshToken=jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .user(new UserDTO(
                        saved.getUsername(),
                        saved.getEmail(),
                        saved.getAvatarUrl(),
                        saved.getRole().name(),
                        saved.isAvatarSet()))
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user=userRepository.findByUsername(request.getUsername())
                .orElseThrow(()->new UsernameNotFoundException("User not found"));
        var jwtToken=jwtService.generateToken(user);
        var refreshToken=jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .user(new UserDTO(
                        user.getUsername(),
                        user.getEmail(),
                        user.getAvatarUrl(),
                        user.getRole().name(),
                        user.isAvatarSet()))
                .build();
    }

    public AuthenticationResponse refreshToken(TokenRefreshRequest request) {

        String refreshToken = request.getRefreshToken();
        String username = jwtService.extractUsername(refreshToken);
        var userDetails= userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (jwtService.isTokenValid(refreshToken, userDetails)) {
            String newAccessToken = jwtService.generateToken(userDetails);
            return AuthenticationResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(refreshToken)
                    .user(new UserDTO(
                            userDetails.getUsername(),
                            userDetails.getEmail(),
                            userDetails.getAvatarUrl(),
                            userDetails.getRole().name(),
                            userDetails.isAvatarSet()))
                    .build();
        }else{
            throw new IllegalArgumentException("Invalid refresh token");
        }
    }
}
