package com.experttalk.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.experttalk.entity.Role;
import com.experttalk.entity.User;
import com.experttalk.service.AdminUserService;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // ===================== GET ALL USERS =====================

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        List<User> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // ===================== BLOCK USER =====================

    @PutMapping("/{id}/block")
    public ResponseEntity<Void> blockUser(@PathVariable Long id) {

        adminUserService.blockUser(id);
        return ResponseEntity.ok().build();
    }

    // ===================== UNBLOCK USER =====================

    @PutMapping("/{id}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable Long id) {

        adminUserService.unblockUser(id);
        return ResponseEntity.ok().build();
    }

    // ===================== DELETE USER (SOFT) =====================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {

        adminUserService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // ===================== FILTER BY ROLE (OPTIONAL) =====================

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {

        List<User> users = adminUserService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
}
