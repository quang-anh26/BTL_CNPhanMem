package com.example.messaging.service;

import com.example.messaging.dto.admin.AdminUserView;
import com.example.messaging.dto.admin.DashboardResponse;
import com.example.messaging.entity.User;
import com.example.messaging.entity.enums.UserStatus;
import com.example.messaging.repository.MessageRepository;
import com.example.messaging.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin area (plan section 3 "Admin"):
 *   - separate admin login area (enforced via ROLE_ADMIN in SecurityConfig, /api/admin/**)
 *   - dashboard: total users, online users, locked users, messages per day
 *   - search/view accounts, lock/unlock users
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public DashboardResponse getDashboard() {
        long total = userRepository.count();
        long online = userRepository.countByOnlineTrue();
        long locked = userRepository.countByStatus(UserStatus.LOCKED);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        // Simple count; for large datasets replace with a proper @Query using createdAt BETWEEN
        long messagesToday = messageRepository.findAll().stream()
                .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().isAfter(startOfDay))
                .count();

        return DashboardResponse.builder()
                .totalUsers(total)
                .onlineUsers(online)
                .lockedUsers(locked)
                .messagesToday(messagesToday)
                .build();
    }

    public List<AdminUserView> searchUsers(String keyword) {
        List<User> users = (keyword == null || keyword.isBlank())
                ? userRepository.findAll()
                : userRepository.searchByUsernameOrDisplayName(keyword);

        return users.stream().map(this::toView).collect(Collectors.toList());
    }

    @Transactional
    public void setLocked(Long userId, boolean locked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> com.example.messaging.exception.ApiException.notFound("Không tìm thấy người dùng"));
        user.setStatus(locked ? UserStatus.LOCKED : UserStatus.ACTIVE);
        userRepository.save(user);
    }

    private AdminUserView toView(User u) {
        return AdminUserView.builder()
                .userId(u.getUserId())
                .username(u.getUsername())
                .displayName(u.getDisplayName())
                .status(u.getStatus().name())
                .role(u.getRole().name())
                .online(u.isOnline())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
