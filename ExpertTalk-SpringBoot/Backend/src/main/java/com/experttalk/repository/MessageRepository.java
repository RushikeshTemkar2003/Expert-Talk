package com.experttalk.repository;

import com.experttalk.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatSessionIdOrderBySentAtAsc(Long chatSessionId);
    Long countByChatSessionId(Long chatSessionId);
}