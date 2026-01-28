package com.experttalk.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.experttalk.entity.Role;
import com.experttalk.entity.User;
import com.experttalk.repository.UserRepository;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ===================== GET ALL USERS =====================

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ===================== BLOCK USER =====================

    public void blockUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(false);
        userRepository.save(user);
    }

    // ===================== UNBLOCK USER =====================

    public void unblockUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(true);
        userRepository.save(user);
    }

    // ===================== SOFT DELETE USER =====================

    public void deleteUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(false);
        userRepository.save(user);
    }

    // ===================== FILTER USERS BY ROLE (OPTIONAL) =====================

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
}
