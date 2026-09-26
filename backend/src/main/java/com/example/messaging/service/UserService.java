package com.example.messaging.service;

import com.example.messaging.dto.auth.ChangePasswordRequest;
import com.example.messaging.dto.user.UpdateProfileRequest;
import com.example.messaging.dto.user.UserProfileResponse;
import com.example.messaging.entity.User;
import com.example.messaging.exception.ApiException;
import com.example.messaging.repository.UserRepository;
import com.example.messaging.repository.FriendRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final PasswordEncoder passwordEncoder;

    public User getByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
    }

    public User getByUsernameOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
    }

    public UserProfileResponse getProfile(Long userId) {
        return toProfileResponse(getByIdOrThrow(userId));
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getByIdOrThrow(userId);
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        if (request.getBio() != null) user.setBio(request.getBio());
        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getByIdOrThrow(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw ApiException.badRequest("Mật khẩu cũ không đúng");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserProfileResponse> search(String keyword, Long excludeUserId) {
        return userRepository.searchByUsernameOrDisplayName(keyword).stream()
                .filter(u -> !u.getUserId().equals(excludeUserId))
                .map(user -> toSearchResponse(user, excludeUserId))
                .collect(Collectors.toList());
    }

            private UserProfileResponse toSearchResponse(User user, Long viewerId) {
            String relationshipStatus = friendRequestRepository.findRelationship(viewerId, user.getUserId())
                .stream()
                .findFirst()
                .map(request -> request.getStatus().name())
                .orElse(null);
            return UserProfileResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .online(user.isOnline())
                .status(user.getStatus().name())
                .relationshipStatus(relationshipStatus)
                .build();
            }

    @Transactional
    public void setOnlineStatus(Long userId, boolean online) {
        User user = getByIdOrThrow(userId);
        user.setOnline(online);
        if (!online) {
            user.setLastSeenAt(java.time.LocalDateTime.now());
        }
        userRepository.save(user);
    }

    @Transactional
    public void markAllOffline() {
        userRepository.findAll().stream()
                .filter(User::isOnline)
                .forEach(user -> {
                    user.setOnline(false);
                    user.setLastSeenAt(java.time.LocalDateTime.now());
                });
        userRepository.flush();
    }

    public UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .online(user.isOnline())
                .status(user.getStatus().name())
                .relationshipStatus(null)
                .build();
    }
}
