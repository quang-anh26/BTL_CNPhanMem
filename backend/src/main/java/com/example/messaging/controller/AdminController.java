package com.example.messaging.controller;

import com.example.messaging.dto.admin.AdminUserView;
import com.example.messaging.dto.admin.DashboardResponse;
import com.example.messaging.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin area (plan section 3 "Admin"). Restricted to ROLE_ADMIN via SecurityConfig
 * ("/api/admin/**" requires hasRole("ADMIN")) - satisfies "Đăng nhập khu vực quản trị riêng"
 * (same JWT login, but only ADMIN role users can call these endpoints).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserView>> users(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(adminService.searchUsers(q));
    }

    @PostMapping("/users/{id}/lock")
    public ResponseEntity<Void> lock(@PathVariable Long id) {
        adminService.setLocked(id, true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/unlock")
    public ResponseEntity<Void> unlock(@PathVariable Long id) {
        adminService.setLocked(id, false);
        return ResponseEntity.noContent().build();
    }
}
