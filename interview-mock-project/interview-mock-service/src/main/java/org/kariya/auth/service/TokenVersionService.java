package org.kariya.auth.service;

import lombok.RequiredArgsConstructor;
import org.kariya.constant.Constants;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenVersionService {
    private static final int DEFAULT_TOKEN_VERSION = 1;

    private final StringRedisTemplate stringRedisTemplate;

    public Integer getCurrentTokenVersion(Long userId) {
        String key = Constants.userTokenVersionKey(userId);
        String value = stringRedisTemplate.opsForValue().get(key);

        if (value == null || value.isBlank()) {
            stringRedisTemplate.opsForValue().set(key, String.valueOf(DEFAULT_TOKEN_VERSION));
            return DEFAULT_TOKEN_VERSION;
        }

        return Integer.valueOf(value);
    }

    public Integer increaseTokenVersion(Long userId) {
        String key = Constants.userTokenVersionKey(userId);
        Long next = stringRedisTemplate.opsForValue().increment(key);

        if (next == null) {
            stringRedisTemplate.opsForValue().set(key, String.valueOf(DEFAULT_TOKEN_VERSION + 1));
            return DEFAULT_TOKEN_VERSION + 1;
        }

        return next.intValue();
    }

    public void resetTokenVersion(Long userId) {
        stringRedisTemplate.opsForValue().set(Constants.userTokenVersionKey(userId), String.valueOf(DEFAULT_TOKEN_VERSION));
    }
}