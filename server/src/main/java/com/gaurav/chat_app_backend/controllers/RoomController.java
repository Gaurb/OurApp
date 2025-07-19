//package com.gaurav.chat_app_backend.controllers;
//
//import com.gaurav.chat_app_backend.constants.AppConstants;
//import com.gaurav.chat_app_backend.entities.Message;
//import com.gaurav.chat_app_backend.entities.Room;
//import com.gaurav.chat_app_backend.repo.RoomRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/v1/room")
//@RequiredArgsConstructor
//@CrossOrigin(AppConstants.FRONT_END_BASE_URL)
//public class RoomController {
//    private final RoomRepository roomRepository;
////    create room
//    @PostMapping
//    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
//        if(roomRepository.findByRoomId(roomId) != null) {
//            return ResponseEntity.badRequest().body("Room already exists");
//        }
//        else{
//            Room room = new Room();
//            room.setRoomId(roomId);
//            roomRepository.save(room);
//            return ResponseEntity.ok().body(room);
//        }
//    }
////    get rooms
//    @GetMapping("/{roomId}")
//    public ResponseEntity<?> getRoom(@PathVariable String roomId) {
//        Room room = roomRepository.findByRoomId(roomId);
//        if(room == null) {
//            return new ResponseEntity<>("Room not found", HttpStatus.NOT_FOUND);
//        }
//        return ResponseEntity.ok(room);
//    }
//
////    get messages of a room
//    @GetMapping("/{roomId}/messages")
//    public ResponseEntity<?> getMessages(@PathVariable String roomId,
//        @RequestParam(value = "page", defaultValue = "0", required=false) int page,
//        @RequestParam(value = "size", defaultValue = "10", required=false)  int size) {
//        Room room = roomRepository.findByRoomId(roomId);
//        if(room == null) {
//            return ResponseEntity.notFound().build();
//        }
//        List<Message> messages= room.getMessages();
//        int start = Math.min(page * size, messages.size());
//        int end = Math.min((page + 1) * size, messages.size());
//        List<Message> paginatedMessages = messages.subList(start, end);
//        return ResponseEntity.ok(paginatedMessages);
//    }
//}
