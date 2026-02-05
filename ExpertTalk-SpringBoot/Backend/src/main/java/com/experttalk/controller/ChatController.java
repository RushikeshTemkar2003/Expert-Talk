package com.experttalk.controller;

import com.experttalk.model.*;
import com.experttalk.repository.*;
import com.experttalk.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/start")
    public ResponseEntity<?> startChatSession(@RequestBody StartChatDto dto, @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid user token"));
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }

            Optional<User> expertOpt = userRepository.findById(dto.getExpertId());
            if (expertOpt.isEmpty() || expertOpt.get().getUserType() != UserType.EXPERT) {
                return ResponseEntity.badRequest().body(new MessageResponse("Expert not found"));
            }

            ChatSession session = new ChatSession();
            session.setUserId(userId);
            session.setExpertId(dto.getExpertId());
            session.setStartTime(LocalDateTime.now());
            session.setStatus(SessionStatus.ACTIVE);
            session.setDurationMinutes(dto.getDuration() != null ? dto.getDuration() : 60); // Store paid duration

            chatSessionRepository.save(session);

            return ResponseEntity.ok(new SessionResponse(session.getId()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to start chat: " + ex.getMessage()));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionDto>> getUserSessions(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            List<ChatSession> sessions = chatSessionRepository.findByUserIdOrExpertIdOrderByStartTimeDesc(userId);
            List<ChatSessionDto> sessionDtos = sessions.stream()
                    .map(s -> convertToChatSessionDto(s, userId))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(sessionDtos);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/sessions/{sessionId}/info")
    public ResponseEntity<ChatSessionDto> getSessionInfo(@PathVariable Long sessionId, @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
            if (sessionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ChatSession session = sessionOpt.get();
            if (!session.getUserId().equals(userId) && !session.getExpertId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            ChatSessionDto sessionDto = convertToChatSessionDto(session, userId);
            return ResponseEntity.ok(sessionDto);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long sessionId, @RequestBody SendMessageDto dto, @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid user token"));
            }

            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
            if (sessionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ChatSession session = sessionOpt.get();
            if (!session.getUserId().equals(userId) && !session.getExpertId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            if (session.getStatus() != SessionStatus.ACTIVE) {
                return ResponseEntity.badRequest().body(new MessageResponse("Session is not active"));
            }

            Message message = new Message();
            message.setChatSessionId(sessionId);
            message.setSenderId(userId);
            message.setContent(dto.getContent());
            message.setSentAt(LocalDateTime.now());
            message.setIsRead(false);

            messageRepository.save(message);
            System.out.println("Message saved: " + message.getContent() + " for session: " + sessionId);

            MessageDto messageDto = convertToMessageDto(message);
            return ResponseEntity.ok(messageDto);
        } catch (Exception ex) {
            System.err.println("Error sending message: " + ex.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to send message: " + ex.getMessage()));
        }
    }
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<MessageDto>> getSessionMessages(@PathVariable Long sessionId, @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
            if (sessionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ChatSession session = sessionOpt.get();
            if (!session.getUserId().equals(userId) && !session.getExpertId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            List<Message> messages = messageRepository.findByChatSessionIdOrderBySentAtAsc(sessionId);
            List<MessageDto> messageDtos = messages.stream()
                    .map(this::convertToMessageDto)
                    .collect(Collectors.toList());

            // Mark messages as read (simplified - mark all as read)
            messages.stream()
                    .filter(m -> !m.getSenderId().equals(userId) && !m.getIsRead())
                    .forEach(m -> {
                        m.setIsRead(true);
                        messageRepository.save(m);
                    });

            return ResponseEntity.ok(messageDtos);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/sessions/{sessionId}/end")
    public ResponseEntity<?> endChatSession(@PathVariable Long sessionId, @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid user token"));
            }

            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
            if (sessionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ChatSession session = sessionOpt.get();
            if (!session.getUserId().equals(userId) && !session.getExpertId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }

            session.setEndTime(LocalDateTime.now());
            session.setStatus(SessionStatus.COMPLETED);

            // Calculate duration and total amount
            long minutes = ChronoUnit.MINUTES.between(session.getStartTime(), session.getEndTime());
            session.setDurationMinutes((int) Math.max(1, minutes)); // Minimum 1 minute

            Optional<User> expertOpt = userRepository.findById(session.getExpertId());
            if (expertOpt.isPresent() && expertOpt.get().getHourlyRate() != null) {
                BigDecimal hourlyRate = expertOpt.get().getHourlyRate();
                BigDecimal totalAmount = hourlyRate.multiply(BigDecimal.valueOf(session.getDurationMinutes()))
                        .divide(BigDecimal.valueOf(60), 2, BigDecimal.ROUND_HALF_UP);
                session.setTotalAmount(totalAmount);
            }

            chatSessionRepository.save(session);

            return ResponseEntity.ok(new EndSessionResponse(session.getTotalAmount(), session.getDurationMinutes()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to end session: " + ex.getMessage()));
        }
    }

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        return null;
    }

    private ChatSessionDto convertToChatSessionDto(ChatSession session, Long currentUserId) {
        ChatSessionDto dto = new ChatSessionDto();
        dto.setId(session.getId());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setStatus(session.getStatus().ordinal());
        dto.setTotalAmount(session.getTotalAmount());
        
        // Calculate timer information
        if (session.getStatus() == SessionStatus.ACTIVE && session.getStartTime() != null) {
            long elapsedMinutes = ChronoUnit.MINUTES.between(session.getStartTime(), LocalDateTime.now());
            long maxDurationMinutes = session.getDurationMinutes() != null ? session.getDurationMinutes() : 60; // Use paid duration
            long remainingMinutes = Math.max(0, maxDurationMinutes - elapsedMinutes);
            
            dto.setRemainingSeconds((int) (remainingMinutes * 60));
            dto.setIsExpired(remainingMinutes <= 0);
            
            // If expired, mark session as completed
            if (remainingMinutes <= 0 && session.getStatus() == SessionStatus.ACTIVE) {
                session.setEndTime(LocalDateTime.now());
                session.setStatus(SessionStatus.COMPLETED);
                session.setDurationMinutes((int) Math.max(1, elapsedMinutes));
                chatSessionRepository.save(session);
                dto.setStatus(SessionStatus.COMPLETED.ordinal());
                dto.setIsExpired(true);
            }
        } else {
            dto.setRemainingSeconds(0);
            dto.setIsExpired(true);
        }
        
        // Set user and expert names by fetching from repository to avoid lazy loading issues
        Optional<User> userOpt = userRepository.findById(session.getUserId());
        if (userOpt.isPresent()) {
            dto.setUserName(userOpt.get().getName());
        }
        
        Optional<User> expertOpt = userRepository.findById(session.getExpertId());
        if (expertOpt.isPresent()) {
            dto.setExpertName(expertOpt.get().getName());
        }
        
        // Get last message (simplified)
        List<Message> messages = messageRepository.findByChatSessionIdOrderBySentAtAsc(session.getId());
        if (!messages.isEmpty()) {
            dto.setLastMessage(messages.get(messages.size() - 1).getContent());
        }
        
        // Count unread messages
        long unreadCount = messages.stream()
                .filter(m -> !m.getSenderId().equals(currentUserId) && !m.getIsRead())
                .count();
        dto.setUnreadCount((int) unreadCount);
        
        return dto;
    }

    private MessageDto convertToMessageDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setSentAt(message.getSentAt());
        dto.setIsRead(message.getIsRead());
        dto.setSenderId(message.getSenderId());
        
        // Fetch sender name to avoid lazy loading issues
        Optional<User> senderOpt = userRepository.findById(message.getSenderId());
        dto.setSenderName(senderOpt.isPresent() ? senderOpt.get().getName() : "");
        
        return dto;
    }

    // DTOs
    public static class StartChatDto {
        private Long expertId;
        private Integer duration; // Duration in minutes

        public Long getExpertId() { return expertId; }
        public void setExpertId(Long expertId) { this.expertId = expertId; }
        
        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }
    }

    public static class SendMessageDto {
        private String content;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class SessionResponse {
        private Long sessionId;

        public SessionResponse(Long sessionId) { this.sessionId = sessionId; }

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    }

    public static class EndSessionResponse {
        private BigDecimal totalAmount;
        private Integer duration;

        public EndSessionResponse(BigDecimal totalAmount, Integer duration) {
            this.totalAmount = totalAmount;
            this.duration = duration;
        }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) { this.message = message; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ChatSessionDto {
        private Long id;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer status;
        private BigDecimal totalAmount;
        private String userName;
        private String expertName;
        private String lastMessage;
        private Integer unreadCount;
        private Integer remainingSeconds;
        private Boolean isExpired;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

        public Integer getStatus() { return status; }
        public void setStatus(Integer status) { this.status = status; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public String getExpertName() { return expertName; }
        public void setExpertName(String expertName) { this.expertName = expertName; }

        public String getLastMessage() { return lastMessage; }
        public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

        public Integer getUnreadCount() { return unreadCount; }
        public void setUnreadCount(Integer unreadCount) { this.unreadCount = unreadCount; }
        
        public Integer getRemainingSeconds() { return remainingSeconds; }
        public void setRemainingSeconds(Integer remainingSeconds) { this.remainingSeconds = remainingSeconds; }
        
        public Boolean getIsExpired() { return isExpired; }
        public void setIsExpired(Boolean isExpired) { this.isExpired = isExpired; }
    }

    public static class MessageDto {
        private Long id;
        private String content;
        private LocalDateTime sentAt;
        private Boolean isRead;
        private Long senderId;
        private String senderName;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public LocalDateTime getSentAt() { return sentAt; }
        public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

        public Boolean getIsRead() { return isRead; }
        public void setIsRead(Boolean isRead) { this.isRead = isRead; }

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
    }
}