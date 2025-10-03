package com.gaurav.chat_app_backend.controllers;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gaurav.chat_app_backend.payload.AddMembersRequest;
import com.gaurav.chat_app_backend.payload.CreateRoomRequest;
import com.gaurav.chat_app_backend.payload.RemoveMemberRequest;
import com.gaurav.chat_app_backend.payload.RoomResponse;
import com.gaurav.chat_app_backend.payload.UpdateGroupPhotoRequest;
import com.gaurav.chat_app_backend.payload.UpdateRoomNameRequest;
import com.gaurav.chat_app_backend.services.RoomService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomChatController {

    private static final Logger logger = LoggerFactory.getLogger(RoomChatController.class);

    @Autowired
    private RoomService roomService;

    /**
     * Create a new group chat room
     * POST /api/rooms/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        try {
            String username = getAuthenticatedUsername();
            RoomResponse response = roomService.createRoom(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error creating room: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating room", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the room: " + e.getMessage()));
        }
    }

    /**
     * Get all rooms for the authenticated user
     * GET /api/rooms/all
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllRooms() {
        try {
            String username = getAuthenticatedUsername();
            List<RoomResponse> rooms = roomService.getAllRooms(username);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while fetching rooms"));
        }
    }

    /**
     * Get room by name
     * GET /api/rooms/{roomName}
     */
    @GetMapping("/{roomName}")
    public ResponseEntity<?> getRoomByName(@PathVariable String roomName) {
        try {
            String username = getAuthenticatedUsername();
            RoomResponse room = roomService.getRoomByName(roomName, username);
            return ResponseEntity.ok(room);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while fetching the room"));
        }
    }

    /**
     * Update room name (Admin only)
     * PUT /api/rooms/update-name
     */
    @PutMapping("/update-name")
    public ResponseEntity<?> updateRoomName(@Valid @RequestBody UpdateRoomNameRequest request) {
        try {
            String username = getAuthenticatedUsername();
            RoomResponse response = roomService.updateRoomName(request, username);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating room name"));
        }
    }

    /**
     * Update group photo (Admin only)
     * PUT /api/rooms/update-photo
     */
    @PutMapping("/update-photo")
    public ResponseEntity<?> updateGroupPhoto(@Valid @RequestBody UpdateGroupPhotoRequest request) {
        try {
            String username = getAuthenticatedUsername();
            RoomResponse response = roomService.updateGroupPhoto(request, username);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating group photo"));
        }
    }

    /**
     * Add members to room (All members can add)
     * POST /api/rooms/add-members
     */
    @PostMapping("/add-members")
    public ResponseEntity<?> addMembers(@Valid @RequestBody AddMembersRequest request) {
        try {
            String username = getAuthenticatedUsername();
            RoomResponse response = roomService.addMembers(request, username);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while adding members"));
        }
    }

    /**
     * Remove member from room (Admin only)
     * DELETE /api/rooms/remove-member
     */
    @DeleteMapping("/remove-member")
    public ResponseEntity<?> removeMember(@Valid @RequestBody RemoveMemberRequest request) {
        try {
            String username = getAuthenticatedUsername();
            RoomResponse response = roomService.removeMember(request, username);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while removing member"));
        }
    }

    /**
     * Leave room
     * DELETE /api/rooms/{roomName}/leave
     */
    @DeleteMapping("/{roomName}/leave")
    public ResponseEntity<?> leaveRoom(@PathVariable String roomName) {
        try {
            String username = getAuthenticatedUsername();
            String message = roomService.leaveRoom(roomName, username);
            return ResponseEntity.ok(new SuccessResponse(message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while leaving the room"));
        }
    }

    /**
     * Delete room (Admin only)
     * DELETE /api/rooms/{roomName}
     */
    @DeleteMapping("/{roomName}")
    public ResponseEntity<?> deleteRoom(@PathVariable String roomName) {
        try {
            String username = getAuthenticatedUsername();
            String message = roomService.deleteRoom(roomName, username);
            return ResponseEntity.ok(new SuccessResponse(message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deleting the room"));
        }
    }

    // Helper method to get authenticated username
    private String getAuthenticatedUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        return auth.getName();
    }

    // Response DTOs
    record ErrorResponse(String error) {}
    record SuccessResponse(String message) {}
}
