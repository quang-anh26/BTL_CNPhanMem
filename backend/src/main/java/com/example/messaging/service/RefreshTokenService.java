package com.example.messaging.service;

import com.example.messaging.entity.RefreshToken;
import com.example.messaging.entity.User;
import com.example.messaging.exception.ApiException;
import com.example.messaging.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Manages the Refresh Token lifecycle described in plan section 4:
 * "Authentication & duy trì phiên đăng nhập" —
 * Refresh Token keeps the user's session alive so they don't have to log in
 * again every time they reopen the app, as long as the refresh token is
 * still valid (not expired / not revoked).
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    public RefreshToken createRefreshToken(User user) {
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(token);
    }

    public RefreshToken verify(String tokenValue) {
        RefreshToken token = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> ApiException.unauthorized("Refresh token không hợp lệ"));

        if (token.isRevoked()) {
            throw ApiException.unauthorized("Refresh token đã bị thu hồi. Vui lòng đăng nhập lại");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw ApiException.unauthorized("Refresh token đã hết hạn. Vui lòng đăng nhập lại");
        }
        return token;
    }

    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.deleteByUserUserId(userId);
    }
}
