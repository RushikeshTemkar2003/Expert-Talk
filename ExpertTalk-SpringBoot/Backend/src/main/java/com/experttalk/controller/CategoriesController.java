package com.experttalk.controller;

import com.experttalk.model.Category;
import com.experttalk.model.User;
import com.experttalk.model.UserType;
import com.experttalk.repository.CategoryRepository;
import com.experttalk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoriesController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryDto> categoryDtos = categories.stream()
                .map(this::convertToCategoryDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryDtos);
    }

    @GetMapping("/{categoryId}/experts")
    public ResponseEntity<List<ExpertDto>> getExpertsByCategory(@PathVariable Long categoryId) {
        List<User> experts = userRepository.findAvailableExpertsByCategory(UserType.EXPERT, categoryId);
        List<ExpertDto> expertDtos = experts.stream()
                .map(this::convertToExpertDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(expertDtos);
    }

    private CategoryDto convertToCategoryDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setIcon(category.getIcon());
        
        // Count experts in this category
        List<User> experts = userRepository.findAvailableExpertsByCategory(UserType.EXPERT, category.getId());
        dto.setExpertCount(experts.size());
        
        return dto;
    }

    private ExpertDto convertToExpertDto(User user) {
        ExpertDto dto = new ExpertDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setBio(user.getBio());
        dto.setHourlyRate(user.getHourlyRate());
        dto.setIsAvailable(user.getIsOnline() != null && user.getIsOnline()); // Available only if online
        dto.setIsOnline(user.getIsOnline());
        dto.setCategoryName(user.getCategory() != null ? user.getCategory().getName() : "");
        dto.setQueueCount(0); // TODO: Implement queue count
        return dto;
    }

    // DTOs
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

    public static class ExpertDto {
        private Long id;
        private String name;
        private String bio;
        private java.math.BigDecimal hourlyRate;
        private Boolean isAvailable;
        private Boolean isOnline;
        private String categoryName;
        private Integer queueCount;
        private java.time.LocalDateTime lastSeenAt;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }

        public java.math.BigDecimal getHourlyRate() { return hourlyRate; }
        public void setHourlyRate(java.math.BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

        public Boolean getIsAvailable() { return isAvailable; }
        public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

        public Boolean getIsOnline() { return isOnline; }
        public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public Integer getQueueCount() { return queueCount; }
        public void setQueueCount(Integer queueCount) { this.queueCount = queueCount; }

        public java.time.LocalDateTime getLastSeenAt() { return lastSeenAt; }
        public void setLastSeenAt(java.time.LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
    }
}