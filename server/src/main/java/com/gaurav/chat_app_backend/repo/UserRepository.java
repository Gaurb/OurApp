package com.gaurav.chat_app_backend.repo;

import com.gaurav.chat_app_backend.entities.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, ObjectId> {

    Optional<User> findByUsername(String username);

    @Query("{ 'username': { $ne: ?0, $regex: ?1, $options: 'i' } }")
    List<User> findByUsernameRegexAndNotCurrent(String currentUsername, String regex);

    boolean existsByUsername(String username);
}
