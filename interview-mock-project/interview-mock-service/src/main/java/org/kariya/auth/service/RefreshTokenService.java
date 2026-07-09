package org.kariya.auth.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.LoginSession;
import org.kariya.constant.Constants;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public String generateRawToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    public void saveSession(LoginSession session, Duration ttl) {
        try {
            String sessionKey = Constants.loginSessionKey(session.getUserId(), session.getDeviceId());
            String value = objectMapper.writeValueAsString(session);

            redisTemplate.opsForValue().set(sessionKey, value, ttl);
            redisTemplate.opsForValue().set(
                    Constants.refreshIndexKey(session.getRefreshTokenHash()),
                    session.getUserId() + ":" + session.getDeviceId(),
                    ttl
            );
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("保存登录会话失败", e);
        }
    }

    public LoginSession getSession(Long userId, String deviceId) {
        try {
            String raw = redisTemplate.opsForValue().get(Constants.loginSessionKey(userId, deviceId));
            if (raw == null) return null;
            return objectMapper.readValue(raw, LoginSession.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("读取登录会话失败", e);
        }
    }

    public LoginSession getSessionByRefreshToken(String rawRefreshToken) {
        String refreshHash = hash(rawRefreshToken);
        String indexValue = redisTemplate.opsForValue().get(Constants.refreshIndexKey(refreshHash));

        if (indexValue == null) {
            return null;
        }

        String[] parts = indexValue.split(":", 2);
        if (parts.length != 2) {
            return null;
        }

        return getSession(Long.valueOf(parts[0]), parts[1]);
    }

    public void deleteSession(LoginSession session) {
        redisTemplate.delete(Constants.loginSessionKey(session.getUserId(), session.getDeviceId()));
        redisTemplate.delete(Constants.refreshIndexKey(session.getRefreshTokenHash()));
    }

    public void markRefreshTokenUsed(String refreshTokenHash, Duration ttl) {
        redisTemplate.opsForValue().set(Constants.refreshUsedKey(refreshTokenHash), "1", ttl);
    }

    public boolean wasRefreshTokenUsed(String refreshTokenHash) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(Constants.refreshUsedKey(refreshTokenHash)));
    }
}