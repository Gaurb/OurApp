package com.gaurav.chat_app_backend.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gaurav.chat_app_backend.entities.Role;
import com.gaurav.chat_app_backend.entities.Room;
import com.gaurav.chat_app_backend.entities.RoomMember;
import com.gaurav.chat_app_backend.entities.User;
import com.gaurav.chat_app_backend.payload.AddMembersRequest;
import com.gaurav.chat_app_backend.payload.CreateRoomRequest;
import com.gaurav.chat_app_backend.payload.RemoveMemberRequest;
import com.gaurav.chat_app_backend.payload.RoomMemberResponse;
import com.gaurav.chat_app_backend.payload.RoomResponse;
import com.gaurav.chat_app_backend.payload.UpdateGroupPhotoRequest;
import com.gaurav.chat_app_backend.payload.UpdateRoomNameRequest;
import com.gaurav.chat_app_backend.repo.RoomRepository;
import com.gaurav.chat_app_backend.repo.UserRepository;

@Service
public class RoomService {
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new group chat room
     */
    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request, String creatorUsername) {
        // Validate room name doesn't exist
        if (roomRepository.findByRoomName(request.roomName()) != null) {
            throw new IllegalArgumentException("Room with the same name already exists");
        }

        // Get creator user
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new IllegalArgumentException("Creator user not found"));

        // Validate creator has an ID (required for DBRef)
        if (creator.getId() == null) {
            throw new IllegalStateException("Creator user does not have a valid ID");
        }

        // Create room
        Room room = new Room();
        room.setRoomName(request.roomName());
        room.setCreatedAt(LocalDateTime.now());
        room.setCreatedBy(creatorUsername);
        room.setGroupPhotoSet(false);

        // Initialize members list
        List<RoomMember> members = new ArrayList<>();
        
        // Add creator as admin
        RoomMember adminMember = new RoomMember();
        adminMember.setUsername(creator.getUsername());
        adminMember.setUser(creator);
        adminMember.setRole(Role.GROUP_ADMIN);
        members.add(adminMember);

        // Add other members if provided
        if (request.memberUsernames() != null && !request.memberUsernames().isEmpty()) {
            for (String username : request.memberUsernames()) {
                if (!username.equals(creatorUsername)) {
                    User user = userRepository.findByUsername(username)
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
                    
                    // Validate user has an ID (required for DBRef)
                    if (user.getId() == null) {
                        throw new IllegalStateException("User " + username + " does not have a valid ID");
                    }
                    
                    RoomMember member = new RoomMember();
                    member.setUsername(user.getUsername());
                    member.setUser(user);
                    member.setRole(Role.GROUP_MEMBER);
                    members.add(member);
                }
            }
        }

        room.setMembers(members);
        Room savedRoom = roomRepository.save(room);
        
        return mapToRoomResponse(savedRoom);
    }

    /**
     * Get all rooms for a user
     */
    public List<RoomResponse> getAllRooms(String username) {
        List<Room> rooms = roomRepository.findRoomsByUsername(username);
        
        // Sort by updatedAt (most recent first), then by createdAt if updatedAt is null
        rooms.sort((r1, r2) -> {
            if (r2.getUpdatedAt() != null && r1.getUpdatedAt() != null) {
                return r2.getUpdatedAt().compareTo(r1.getUpdatedAt());
            } else if (r2.getUpdatedAt() != null) {
                return 1;
            } else if (r1.getUpdatedAt() != null) {
                return -1;
            } else {
                return r2.getCreatedAt().compareTo(r1.getCreatedAt());
            }
        });
        
        return rooms.stream()
                .map(this::mapToRoomResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get room by name
     */
    public RoomResponse getRoomByName(String roomName, String username) {
        Room room = roomRepository.findByRoomName(roomName);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        // Verify user is a member
        if (!isUserMember(room, username)) {
            throw new IllegalArgumentException("You are not a member of this room");
        }

        return mapToRoomResponse(room);
    }

    /**
     * Update room name (Admin only)
     */
    @Transactional
    public RoomResponse updateRoomName(UpdateRoomNameRequest request, String username) {
        Room room = roomRepository.findByRoomName(request.currentRoomName());
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        // Verify user is admin
        if (!isUserAdmin(room, username)) {
            throw new IllegalArgumentException("Only group admin can update room name");
        }

        // Check if new name already exists
        if (!request.currentRoomName().equals(request.newRoomName())) {
            Room existingRoom = roomRepository.findByRoomName(request.newRoomName());
            if (existingRoom != null) {
                throw new IllegalArgumentException("Room with the new name already exists");
            }
        }

        room.setRoomName(request.newRoomName());
        room.setUpdatedAt(LocalDateTime.now());
        room.setUpdatedBy(username);
        
        Room updatedRoom = roomRepository.save(room);
        return mapToRoomResponse(updatedRoom);
    }

    /**
     * Update group photo (Admin only)
     */
    @Transactional
    public RoomResponse updateGroupPhoto(UpdateGroupPhotoRequest request, String username) {
        Room room = roomRepository.findByRoomName(request.roomName());
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        // Verify user is admin
        if (!isUserAdmin(room, username)) {
            throw new IllegalArgumentException("Only group admin can update group photo");
        }

        room.setGroupPhotoUrl(request.photoUrl());
        room.setGroupPhotoSet(true);
        room.setUpdatedAt(LocalDateTime.now());
        room.setUpdatedBy(username);
        
        Room updatedRoom = roomRepository.save(room);
        return mapToRoomResponse(updatedRoom);
    }

    /**
     * Add members to room (All members can add)
     */
    @Transactional
    public RoomResponse addMembers(AddMembersRequest request, String username) {
        Room room = roomRepository.findByRoomName(request.roomName());
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        // Verify user is a member
        if (!isUserMember(room, username)) {
            throw new IllegalArgumentException("Only room members can add new members");
        }

        List<RoomMember> existingMembers = room.getMembers();
        if (existingMembers == null) {
            existingMembers = new ArrayList<>();
        }
        
        for (String newUsername : request.usernames()) {
            // Check if user is already a member
            boolean alreadyMember = existingMembers.stream()
                    .anyMatch(m -> m.getUsername().equals(newUsername));
            
            if (!alreadyMember) {
                User user = userRepository.findByUsername(newUsername)
                        .orElseThrow(() -> new IllegalArgumentException("User not found: " + newUsername));
                
                // Validate user has an ID (required for DBRef)
                if (user.getId() == null) {
                    throw new IllegalStateException("User " + newUsername + " does not have a valid ID");
                }
                
                RoomMember newMember = new RoomMember();
                newMember.setUsername(user.getUsername());
                newMember.setUser(user);
                newMember.setRole(Role.GROUP_MEMBER);
                existingMembers.add(newMember);
            }
        }

        room.setMembers(existingMembers);
        room.setUpdatedAt(LocalDateTime.now());
        room.setUpdatedBy(username);
        
        Room updatedRoom = roomRepository.save(room);
        return mapToRoomResponse(updatedRoom);
    }

    /**
     * Remove member from room (Admin only)
     */
    @Transactional
    public RoomResponse removeMember(RemoveMemberRequest request, String username) {
        Room room = roomRepository.findByRoomName(request.roomName());
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        // Verify user is admin
        if (!isUserAdmin(room, username)) {
            throw new IllegalArgumentException("Only group admin can remove members");
        }

        // Cannot remove the creator/admin themselves
        if (request.username().equals(username)) {
            throw new IllegalArgumentException("Admin cannot remove themselves. Use leave room instead.");
        }

        List<RoomMember> members = room.getMembers();
        boolean removed = members.removeIf(m -> m.getUsername().equals(request.username()));

        if (!removed) {
            throw new IllegalArgumentException("User is not a member of this room");
        }

        room.setMembers(members);
        room.setUpdatedAt(LocalDateTime.now());
        room.setUpdatedBy(username);
        
        Room updatedRoom = roomRepository.save(room);
        return mapToRoomResponse(updatedRoom);
    }

    /**
     * Leave room
     */
    @Transactional
    public String leaveRoom(String roomName, String username) {
        Room room = roomRepository.findByRoomName(roomName);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        List<RoomMember> members = room.getMembers();
        
        // Check if user is admin
        boolean isAdmin = isUserAdmin(room, username);
        
        // Remove the user
        boolean removed = members.removeIf(m -> m.getUser().getUsername().equals(username));

        if (!removed) {
            throw new IllegalArgumentException("You are not a member of this room");
        }

        // If admin left and there are other members, promote the first member to admin
        if (isAdmin && !members.isEmpty()) {
            members.get(0).setRole(Role.GROUP_ADMIN);
        }

        // If no members left, delete the room
        if (members.isEmpty()) {
            roomRepository.delete(room);
            return "Room deleted as no members remaining";
        } else {
            room.setMembers(members);
            room.setUpdatedAt(LocalDateTime.now());
            room.setUpdatedBy(username);
            roomRepository.save(room);
            return "Successfully left the room";
        }
    }

    /**
     * Delete room (Admin only)
     */
    @Transactional
    public String deleteRoom(String roomName, String username) {
        Room room = roomRepository.findByRoomName(roomName);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        // Verify user is admin
        if (!isUserAdmin(room, username)) {
            throw new IllegalArgumentException("Only group admin can delete the room");
        }

        roomRepository.delete(room);
        return "Room deleted successfully";
    }

    // Helper methods

    private boolean isUserMember(Room room, String username) {
        return room.getMembers().stream()
                .anyMatch(m -> m.getUsername().equals(username));
    }

    private boolean isUserAdmin(Room room, String username) {
        return room.getMembers().stream()
                .anyMatch(m -> m.getUsername().equals(username) 
                        && m.getRole() == Role.GROUP_ADMIN);
    }

    private RoomResponse mapToRoomResponse(Room room) {
        List<RoomMemberResponse> memberResponses = room.getMembers().stream()
                .map(member -> new RoomMemberResponse(
                        member.getUser().getUsername(),
                        member.getUser().getEmail(),
                        member.getUser().getAvatarUrl(),
                        member.getUser().isAvatarSet(),
                        member.getRole()
                ))
                .collect(Collectors.toList());

        return new RoomResponse(
                room.getId() != null ? room.getId().toString() : null,
                room.getRoomName(),
                room.getGroupPhotoUrl(),
                room.isGroupPhotoSet(),
                memberResponses,
                room.getCreatedBy(),
                room.getCreatedAt(),
                room.getUpdatedAt()
        );
    }
}
