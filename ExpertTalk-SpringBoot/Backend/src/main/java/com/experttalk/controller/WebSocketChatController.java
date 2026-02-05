package com.experttalk.controller;

import com.experttalk.model.Message;
import com.experttalk.repository.MessageRepository;
import com.experttalk.repository.UserRepository;
import com.experttalk.repository.ChatSessionRepository;
import com.experttalk.model.ChatSession;
import com.experttalk.model.SessionStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;
import java.util.Optional;
import com.experttalk.model.User;

@Controller
public class WebSocketChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        try {
            System.out.println("Received WebSocket message: " + chatMessage.getContent());
            
            // Check if session is active before saving
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(chatMessage.getSessionId());
            if (sessionOpt.isEmpty() || sessionOpt.get().getStatus() != SessionStatus.ACTIVE) {
                System.out.println("Session not active, ignoring message");
                return;
            }
            
            // Save message to database
            Message message = new Message();
            message.setChatSessionId(chatMessage.getSessionId());
            message.setSenderId(chatMessage.getSenderId());
            message.setContent(chatMessage.getContent());
            message.setSentAt(LocalDateTime.now());
            message.setIsRead(false);
            
            Message savedMessage = messageRepository.save(message);
            
            // Get sender name
            Optional<User> senderOpt = userRepository.findById(chatMessage.getSenderId());
            String senderName = senderOpt.isPresent() ? senderOpt.get().getName() : "Unknown";
            
            // Create response message with saved message ID
            ChatMessageResponse response = new ChatMessageResponse();
            response.setId(savedMessage.getId());
            response.setSenderId(savedMessage.getSenderId());
            response.setSenderName(senderName);
            response.setContent(savedMessage.getContent());
            response.setSentAt(savedMessage.getSentAt());
            response.setSessionId(chatMessage.getSessionId());
            
            // Send to session topic
            messagingTemplate.convertAndSend("/topic/session/" + chatMessage.getSessionId(), response);
            System.out.println("Message sent to /topic/session/" + chatMessage.getSessionId());
            
        } catch (Exception e) {
            System.err.println("Error in WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/endSession")
    public void endSession(@Payload EndSessionMessage endSessionMessage) {
        try {
            System.out.println("Session ended by user: " + endSessionMessage.getEndedBy());
            
            // Notify all participants in the session
            messagingTemplate.convertAndSend("/topic/session/" + endSessionMessage.getSessionId() + "/end", endSessionMessage);
            System.out.println("Session end notification sent to /topic/session/" + endSessionMessage.getSessionId() + "/end");
            
        } catch (Exception e) {
            System.err.println("Error in WebSocket session end: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static class EndSessionMessage {
        private Long sessionId;
        private Long endedBy;

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public Long getEndedBy() { return endedBy; }
        public void setEndedBy(Long endedBy) { this.endedBy = endedBy; }
    }

    public static class ChatMessage {
        private Long sessionId;
        private Long senderId;
        private String content;

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class ChatMessageResponse {
        private Long id;
        private Long sessionId;
        private Long senderId;
        private String senderName;
        private String content;
        private LocalDateTime sentAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getSessionId() { return sessionId; }
        public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public LocalDateTime getSentAt() { return sentAt; }
        public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    }
}