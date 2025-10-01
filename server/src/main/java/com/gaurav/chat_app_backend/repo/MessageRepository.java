package com.gaurav.chat_app_backend.repo;

import com.gaurav.chat_app_backend.entities.Message;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, ObjectId> {
    List<Message> findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
        String sender1, String receiver1, String sender2, String receiver2);
    List<Message> findBySenderAndReceiverOrderByTimestampAsc(String sender, String receiver, Pageable pageable);
}
