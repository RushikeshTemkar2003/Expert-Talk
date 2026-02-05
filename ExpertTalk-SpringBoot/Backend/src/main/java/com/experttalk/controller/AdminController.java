package com.experttalk.controller;

import com.experttalk.model.*;
import com.experttalk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ChatSessionRepository chatSessionRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private InquiryRepository inquiryRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        try {
            System.out.println("[DEBUG] Fetching dashboard stats...");
            DashboardStats stats = new DashboardStats();
            
            // Count all users by type
            Long totalUsers = userRepository.countByUserType(UserType.USER);
            if (totalUsers == null) totalUsers = 0L;
            stats.setTotalUsers(totalUsers);
            System.out.println("[DEBUG] Total users: " + totalUsers);
            
            Long totalExperts = userRepository.countByUserType(UserType.EXPERT);
            if (totalExperts == null) totalExperts = 0L;
            stats.setTotalExperts(totalExperts);
            System.out.println("[DEBUG] Total experts: " + totalExperts);
            
            Long totalSessions = chatSessionRepository.count();
            stats.setTotalSessions(totalSessions);
            System.out.println("[DEBUG] Total sessions: " + totalSessions);
            
            Long activeSessions = 0L;
            try {
                activeSessions = chatSessionRepository.countByStatus(SessionStatus.ACTIVE);
            } catch (Exception e) {
                System.out.println("[DEBUG] Could not count active sessions: " + e.getMessage());
            }
            stats.setActiveSessions(activeSessions);
            System.out.println("[DEBUG] Active sessions: " + activeSessions);
            
            BigDecimal totalRevenue = BigDecimal.ZERO;
            try {
                totalRevenue = chatSessionRepository.findAll().stream()
                    .filter(s -> s.getTotalAmount() != null)
                    .map(ChatSession::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            } catch (Exception e) {
                System.out.println("[DEBUG] Could not calculate revenue: " + e.getMessage());
            }
            stats.setTotalRevenue(totalRevenue);
            System.out.println("[DEBUG] Total revenue: " + totalRevenue);
            
            Long totalCategories = categoryRepository.count();
            stats.setTotalCategories(totalCategories);
            System.out.println("[DEBUG] Total categories: " + totalCategories);
            
            Long completedSessions = 0L;
            try {
                completedSessions = chatSessionRepository.countByStatus(SessionStatus.COMPLETED);
            } catch (Exception e) {
                System.out.println("[DEBUG] Could not count completed sessions: " + e.getMessage());
            }
            stats.setCompletedSessions(completedSessions);
            System.out.println("[DEBUG] Completed sessions: " + completedSessions);
            
            Long pendingExperts = 0L;
            try {
                pendingExperts = userRepository.countByUserTypeAndIsApproved(UserType.EXPERT, false);
            } catch (Exception e) {
                System.out.println("[DEBUG] Could not count pending experts: " + e.getMessage());
            }
            stats.setPendingExperts(pendingExperts);
            System.out.println("[DEBUG] Pending experts: " + pendingExperts);
            
            System.out.println("[DEBUG] Dashboard stats fetched successfully");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to fetch dashboard stats: " + e.getMessage());
            e.printStackTrace();
            // Return default stats instead of error
            DashboardStats defaultStats = new DashboardStats();
            defaultStats.setTotalUsers(0L);
            defaultStats.setTotalExperts(0L);
            defaultStats.setTotalSessions(0L);
            defaultStats.setActiveSessions(0L);
            defaultStats.setTotalRevenue(BigDecimal.ZERO);
            defaultStats.setTotalCategories(0L);
            defaultStats.setCompletedSessions(0L);
            defaultStats.setPendingExperts(0L);
            return ResponseEntity.ok(defaultStats);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> userDtos = users.stream().map(user -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", user.getId());
                dto.put("name", user.getName());
                dto.put("email", user.getEmail());
                dto.put("userType", user.getUserType().name());
                dto.put("categoryId", user.getCategoryId());
                dto.put("isApproved", user.getIsApproved());
                dto.put("createdAt", user.getCreatedAt());
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(userDtos);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    
    @GetMapping("/users/test")
    public ResponseEntity<String> testUsers() {
        return ResponseEntity.ok("Test endpoint working");
    }
    
    @GetMapping("/test-db")
    public ResponseEntity<String> testDatabase() {
        try {
            long count = userRepository.count();
            return ResponseEntity.ok("Database has " + count + " users");
        } catch (Exception e) {
            return ResponseEntity.ok("Database error: " + e.getMessage());
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionDto>> getAllSessions() {
        try {
            System.out.println("[DEBUG] Fetching all sessions...");
            List<ChatSession> sessions;
            try {
                sessions = chatSessionRepository.findAllByOrderByStartTimeDesc();
            } catch (Exception e) {
                System.out.println("[DEBUG] findAllByOrderByStartTimeDesc failed, using findAll");
                sessions = chatSessionRepository.findAll();
                sessions.sort((a, b) -> b.getStartTime().compareTo(a.getStartTime()));
            }
            System.out.println("[DEBUG] Found " + sessions.size() + " sessions");
            List<SessionDto> sessionDtos = sessions.stream().map(this::convertToSessionDto).collect(Collectors.toList());
            System.out.println("[DEBUG] Converted to " + sessionDtos.size() + " session DTOs");
            return ResponseEntity.ok(sessionDtos);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to fetch sessions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        try {
            System.out.println("[DEBUG] Fetching all categories...");
            List<Category> categories = categoryRepository.findAll();
            System.out.println("[DEBUG] Found " + categories.size() + " categories");
            List<CategoryDto> categoryDtos = categories.stream().map(this::convertToCategoryDto).collect(Collectors.toList());
            System.out.println("[DEBUG] Converted to " + categoryDtos.size() + " category DTOs");
            return ResponseEntity.ok(categoryDtos);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to fetch categories: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, String> categoryData) {
        try {
            // Validate required fields
            String name = categoryData.get("name");
            String description = categoryData.get("description");
            String icon = categoryData.get("icon");
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Category name is required"));
            }
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Category description is required"));
            }
            if (icon == null || icon.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Category icon is required"));
            }
            
            Category category = new Category();
            category.setName(name.trim());
            category.setDescription(description.trim());
            category.setIcon(icon.trim());
            
            Category savedCategory = categoryRepository.save(category);
            CategoryDto categoryDto = convertToCategoryDto(savedCategory);
            messagingTemplate.convertAndSend("/topic/admin/categories", Map.of("action", "create", "data", categoryDto));
            return ResponseEntity.ok(categoryDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create category: " + e.getMessage()));
        }
    }
    
    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            Optional<Category> existingCategory = categoryRepository.findById(id);
            if (existingCategory.isPresent()) {
                Category cat = existingCategory.get();
                cat.setName(category.getName());
                cat.setDescription(category.getDescription());
                cat.setIcon(category.getIcon());
                Category savedCategory = categoryRepository.save(cat);
                CategoryDto categoryDto = convertToCategoryDto(savedCategory);
                messagingTemplate.convertAndSend("/topic/admin/categories", Map.of("action", "update", "data", categoryDto));
                return ResponseEntity.ok(categoryDto);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            if (categoryRepository.existsById(id)) {
                categoryRepository.deleteById(id);
                messagingTemplate.convertAndSend("/topic/admin/categories", Map.of("action", "delete", "id", id));
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData) {
        try {
            // Validate required fields
            if (!userData.containsKey("name") || !userData.containsKey("email") || !userData.containsKey("password")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name, email, and password are required"));
            }
            
            String email = (String) userData.get("email");
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.status(409).body(Map.of("message", "Email already exists"));
            }
            
            User user = new User();
            user.setName((String) userData.get("name"));
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode((String) userData.get("password")));
            user.setPhone(userData.containsKey("phone") ? (String) userData.get("phone") : "");
            
            // Set user type
            Integer userTypeInt = (Integer) userData.get("userType");
            UserType userType = UserType.fromValue(userTypeInt != null ? userTypeInt : 1);
            user.setUserType(userType);
            
            // Set expert-specific fields
            if (userType == UserType.EXPERT) {
                if (userData.containsKey("categoryId")) {
                    user.setCategoryId(((Number) userData.get("categoryId")).longValue());
                }
                if (userData.containsKey("hourlyRate")) {
                    user.setHourlyRate(new BigDecimal(userData.get("hourlyRate").toString()));
                }
                if (userData.containsKey("bio")) {
                    user.setBio((String) userData.get("bio"));
                }
                user.setIsApproved(userData.containsKey("isApproved") ? (Boolean) userData.get("isApproved") : true);
            } else {
                user.setIsApproved(true);
            }
            
            user.setIsAvailable(true);
            user.setIsOnline(false);
            
            User savedUser = userRepository.save(user);
            
            // Create response without password
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getId());
            response.put("name", savedUser.getName());
            response.put("email", savedUser.getEmail());
            response.put("userType", savedUser.getUserType().name());
            response.put("isApproved", savedUser.getIsApproved());
            
            messagingTemplate.convertAndSend("/topic/admin/users", Map.of("action", "create", "data", response));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create user: " + e.getMessage()));
        }
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> userData) {
        try {
            System.out.println("[DEBUG] Updating user " + id + " with data: " + userData);
            
            Optional<User> existingUser = userRepository.findById(id);
            if (!existingUser.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = existingUser.get();
            System.out.println("[DEBUG] Current user type: " + user.getUserType());
            
            // Update basic fields
            if (userData.containsKey("name")) {
                user.setName((String) userData.get("name"));
            }
            
            if (userData.containsKey("email")) {
                String newEmail = (String) userData.get("email");
                if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.status(409).body(Map.of("message", "Email already exists"));
                }
                user.setEmail(newEmail);
            }
            
            // Update password only if provided
            if (userData.containsKey("password") && !((String) userData.get("password")).isEmpty()) {
                user.setPassword(passwordEncoder.encode((String) userData.get("password")));
            }
            
            if (userData.containsKey("phone")) {
                user.setPhone((String) userData.get("phone"));
            }
            
            // Update user type
            if (userData.containsKey("userType")) {
                Integer userTypeInt = (Integer) userData.get("userType");
                UserType userType = UserType.fromValue(userTypeInt != null ? userTypeInt : 1);
                System.out.println("[DEBUG] Setting user type to: " + userType + " (value: " + userTypeInt + ")");
                user.setUserType(userType);
                
                // Clear expert fields if changing from expert to non-expert
                if (userType != UserType.EXPERT) {
                    user.setCategoryId(null);
                    user.setHourlyRate(null);
                    user.setBio("");
                    user.setIsApproved(true);
                }
            }
            
            // Update expert-specific fields
            if (user.getUserType() == UserType.EXPERT) {
                System.out.println("[DEBUG] Updating expert fields");
                if (userData.containsKey("categoryId")) {
                    Object categoryId = userData.get("categoryId");
                    if (categoryId != null && !categoryId.toString().isEmpty()) {
                        user.setCategoryId(((Number) categoryId).longValue());
                    }
                }
                if (userData.containsKey("hourlyRate")) {
                    Object hourlyRate = userData.get("hourlyRate");
                    if (hourlyRate != null && !hourlyRate.toString().isEmpty()) {
                        user.setHourlyRate(new BigDecimal(hourlyRate.toString()));
                    }
                }
                if (userData.containsKey("bio")) {
                    user.setBio((String) userData.get("bio"));
                }
                if (userData.containsKey("isApproved")) {
                    user.setIsApproved((Boolean) userData.get("isApproved"));
                }
            }
            
            User savedUser = userRepository.save(user);
            System.out.println("[DEBUG] Saved user with type: " + savedUser.getUserType());
            
            // Create response without password
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getId());
            response.put("name", savedUser.getName());
            response.put("email", savedUser.getEmail());
            response.put("userType", savedUser.getUserType().name());
            response.put("isApproved", savedUser.getIsApproved());
            
            messagingTemplate.convertAndSend("/topic/admin/users", Map.of("action", "update", "data", response));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to update user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update user: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
                messagingTemplate.convertAndSend("/topic/admin/users", Map.of("action", "delete", "id", id));
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/sessions/{id}")
    public ResponseEntity<SessionDto> updateSession(@PathVariable Long id, @RequestBody ChatSession session) {
        try {
            Optional<ChatSession> existingSession = chatSessionRepository.findById(id);
            if (existingSession.isPresent()) {
                ChatSession s = existingSession.get();
                if (session.getEndTime() != null) s.setEndTime(session.getEndTime());
                if (session.getStatus() != null) s.setStatus(session.getStatus());
                if (session.getDurationMinutes() != null) s.setDurationMinutes(session.getDurationMinutes());
                if (session.getTotalAmount() != null) s.setTotalAmount(session.getTotalAmount());
                ChatSession savedSession = chatSessionRepository.save(s);
                SessionDto sessionDto = convertToSessionDto(savedSession);
                messagingTemplate.convertAndSend("/topic/admin/sessions", Map.of("action", "update", "data", sessionDto));
                return ResponseEntity.ok(sessionDto);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        try {
            if (chatSessionRepository.existsById(id)) {
                chatSessionRepository.deleteById(id);
                messagingTemplate.convertAndSend("/topic/admin/sessions", Map.of("action", "delete", "id", id));
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/inquiries")
    public ResponseEntity<List<Inquiry>> getInquiries() {
        try {
            System.out.println("[DEBUG] Fetching inquiries...");
            List<Inquiry> inquiries = inquiryRepository.findAllByOrderByCreatedAtDesc();
            System.out.println("[DEBUG] Found " + inquiries.size() + " inquiries");
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to fetch inquiries: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    
    @PutMapping("/inquiries/{id}/mark-read")
    public ResponseEntity<Inquiry> markInquiryRead(@PathVariable Long id) {
        try {
            Optional<Inquiry> inquiry = inquiryRepository.findById(id);
            if (inquiry.isPresent()) {
                Inquiry inq = inquiry.get();
                inq.setIsRead(true);
                Inquiry saved = inquiryRepository.save(inq);
                return ResponseEntity.ok(saved);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private SessionDto convertToSessionDto(ChatSession session) {
        SessionDto dto = new SessionDto();
        dto.setId(session.getId());
        dto.setUserId(session.getUserId());
        dto.setExpertId(session.getExpertId());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setStatus(session.getStatus());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setTotalAmount(session.getTotalAmount());
        
        // Get user and expert names safely
        try {
            userRepository.findById(session.getUserId()).ifPresent(user -> dto.setUserName(user.getName()));
        } catch (Exception e) {
            dto.setUserName("Unknown User");
        }
        
        try {
            userRepository.findById(session.getExpertId()).ifPresent(expert -> dto.setExpertName(expert.getName()));
        } catch (Exception e) {
            dto.setExpertName("Unknown Expert");
        }
        
        // Get message count safely
        try {
            Long messageCount = messageRepository.countByChatSessionId(session.getId());
            dto.setMessageCount(messageCount != null ? messageCount.intValue() : 0);
        } catch (Exception e) {
            dto.setMessageCount(0);
        }
        
        return dto;
    }
    
    private CategoryDto convertToCategoryDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setIcon(category.getIcon());
        
        // Get expert count safely
        try {
            Long expertCount = userRepository.countByCategoryIdAndUserType(category.getId(), UserType.EXPERT);
            dto.setExpertCount(expertCount != null ? expertCount.intValue() : 0);
        } catch (Exception e) {
            dto.setExpertCount(0);
        }
        
        return dto;
    }

    public static class DashboardStats {
        private Long totalUsers;
        private Long totalExperts;
        private Long totalSessions;
        private Long activeSessions;
        private BigDecimal totalRevenue;
        private List<ChatSession> recentSessions;
        private Long totalCategories;
        private Long completedSessions;
        private Long pendingExperts;

        // Getters and Setters
        public Long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

        public Long getTotalExperts() { return totalExperts; }
        public void setTotalExperts(Long totalExperts) { this.totalExperts = totalExperts; }

        public Long getTotalSessions() { return totalSessions; }
        public void setTotalSessions(Long totalSessions) { this.totalSessions = totalSessions; }

        public Long getActiveSessions() { return activeSessions; }
        public void setActiveSessions(Long activeSessions) { this.activeSessions = activeSessions; }

        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

        public List<ChatSession> getRecentSessions() { return recentSessions; }
        public void setRecentSessions(List<ChatSession> recentSessions) { this.recentSessions = recentSessions; }
        
        public Long getTotalCategories() { return totalCategories; }
        public void setTotalCategories(Long totalCategories) { this.totalCategories = totalCategories; }
        
        public Long getCompletedSessions() { return completedSessions; }
        public void setCompletedSessions(Long completedSessions) { this.completedSessions = completedSessions; }
        
        public Long getPendingExperts() { return pendingExperts; }
        public void setPendingExperts(Long pendingExperts) { this.pendingExperts = pendingExperts; }
    }
    
    public static class SessionDto {
        private Long id;
        private Long userId;
        private Long expertId;
        private String userName;
        private String expertName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private SessionStatus status;
        private Integer durationMinutes;
        private BigDecimal totalAmount;
        private Integer messageCount;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public Long getExpertId() { return expertId; }
        public void setExpertId(Long expertId) { this.expertId = expertId; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public String getExpertName() { return expertName; }
        public void setExpertName(String expertName) { this.expertName = expertName; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

        public SessionStatus getStatus() { return status; }
        public void setStatus(SessionStatus status) { this.status = status; }

        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public Integer getMessageCount() { return messageCount; }
        public void setMessageCount(Integer messageCount) { this.messageCount = messageCount; }
    }
    
    public static class CategoryDto {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private Integer expertCount;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }

        public Integer getExpertCount() { return expertCount; }
        public void setExpertCount(Integer expertCount) { this.expertCount = expertCount; }
    }
}