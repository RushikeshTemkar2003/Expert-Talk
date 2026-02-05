package com.experttalk.repository;

import com.experttalk.model.ChatSession;
import com.experttalk.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    @Query("SELECT cs FROM ChatSession cs WHERE cs.userId = :userId OR cs.expertId = :userId ORDER BY cs.startTime DESC")
    List<ChatSession> findByUserIdOrExpertIdOrderByStartTimeDesc(@Param("userId") Long userId);
    
    List<ChatSession> findByUserIdOrderByStartTimeDesc(Long userId);
    List<ChatSession> findByExpertIdOrderByStartTimeDesc(Long expertId);
    List<ChatSession> findAllByOrderByStartTimeDesc();
    Long countByStatus(SessionStatus status);
    List<ChatSession> findTop10ByOrderByStartTimeDesc();
}