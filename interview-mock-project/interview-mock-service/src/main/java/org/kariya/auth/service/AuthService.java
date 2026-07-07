package org.kariya.auth.service;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.LoginRequest;
import org.kariya.auth.entity.LoginResponse;
import org.kariya.auth.entity.UserInfo;
import org.kariya.constant.Constants;
import org.kariya.entity.ResultCode;
import org.kariya.exception.BusinessException;
import org.kariya.utils.JwtTokenUtil;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final long NORMAL_REFRESH_MINUTES = 120;
    private static final long REMEMBER_REFRESH_MINUTES = 7 * 24 * 60;

    private final JwtTokenUtil jwtTokenUtil;
    private final StringRedisTemplate stringRedisTemplate;


    public LoginResponse login(LoginRequest loginRequest) {
        if (!"admin".equals(loginRequest.username()) || !"123456".equals(loginRequest.password())) {
            throw new BusinessException(ResultCode.USERNAME_OR_PASSWORD_ERROR);
        }

        Long userId = 1L;
        String username = loginRequest.username();
        String role = "admin";

        String accessJti = UUID.randomUUID().toString();
        String refreshJti = UUID.randomUUID().toString();
        long refreshMinutes = loginRequest.rememberMeEnabled() ? REMEMBER_REFRESH_MINUTES : NORMAL_REFRESH_MINUTES;
        String accessToken = jwtTokenUtil.generateAccessToken(userId, username, role, accessJti);
        String refreshToken = jwtTokenUtil.generateRefreshToken(userId, username, role, refreshJti, refreshMinutes);
        stringRedisTemplate.opsForValue().set(Constants.refreshTokenKey(refreshJti), String.valueOf(userId), Duration.ofMinutes(refreshMinutes));
        return new LoginResponse(accessToken, refreshToken, new UserInfo(userId, username, role));
    }

    public LoginResponse refresh(String refreshToken) {
        Claims claims = jwtTokenUtil.parseToken(refreshToken);

        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new BusinessException(ResultCode.REFRESH_TOKEN_INVALID);
        }

        String refreshJti = claims.getId();
        Boolean exists = stringRedisTemplate.hasKey(Constants.refreshTokenKey(refreshJti));
        if (!exists) {
            throw new BusinessException(ResultCode.REFRESH_TOKEN_INVALID);
        }

        Long userId = Long.valueOf(claims.getSubject());
        String username = claims.get("username", String.class);
        String role = claims.get("role", String.class);

        String newAccessJti = UUID.randomUUID().toString();
        String newAccessToken = jwtTokenUtil.generateAccessToken(userId, username, role, newAccessJti);

        return new LoginResponse(newAccessToken, refreshToken, new UserInfo(userId, username, role));
    }

    public void logout(String accessToken, String refreshToken) {
        Claims accessClaims = jwtTokenUtil.parseToken(accessToken);
        Claims refreshClaims = jwtTokenUtil.parseToken(refreshToken);

        long remainMillis = accessClaims.getExpiration().getTime() - System.currentTimeMillis();
        if (remainMillis > 0) {
            stringRedisTemplate.opsForValue().set(Constants.accessBlacklistKey(accessClaims.getId()), "1", Duration.ofMillis(remainMillis));
        }
        stringRedisTemplate.delete(Constants.refreshTokenKey(refreshClaims.getId()));
    }
}
