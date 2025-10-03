package com.gaurav.chat_app_backend.repo;

import com.gaurav.chat_app_backend.entities.Room;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends MongoRepository<Room, ObjectId> {
    Room findByRoomName(String roomName);
    
    @Query("{ 'members.username': ?0 }")
    List<Room> findRoomsByUsername(String username);
}
