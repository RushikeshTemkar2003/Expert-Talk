package com.experttalk.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "expert_profiles")
public class ExpertProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to User (role = EXPERT)
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Category selected by expert
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private int experienceYears;
    private String skills;
    private String languages;

    @Column(length = 1000)
    private String bio;

    private double ratePerMinute;

    // Admin-controlled fields
    private boolean verified = false;   // approved or not
    private boolean active = true;       // suspended / blocked

    private String rejectionReason;

    // ===== Constructors =====
    public ExpertProfile() {}

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Category getCategory() {
        return category;
    }

    public int getExperienceYears() {
        return experienceYears;
    }

    public String getSkills() {
        return skills;
    }

    public String getLanguages() {
        return languages;
    }

    public String getBio() {
        return bio;
    }

    public double getRatePerMinute() {
        return ratePerMinute;
    }

    public boolean isVerified() {
        return verified;
    }

    public boolean isActive() {
        return active;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setExperienceYears(int experienceYears) {
        this.experienceYears = experienceYears;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setRatePerMinute(double ratePerMinute) {
        this.ratePerMinute = ratePerMinute;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
