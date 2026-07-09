package org.kariya.auth.service;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.*;
import org.kariya.config.AuthProperties;
import org.kariya.constant.Constants;
import org.kariya.entity.ResultCode;
import org.kariya.exception.BusinessException;
import org.kariya.utils.JwtTokenUtil;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtTokenUtil jwtTokenUtil;
    private final StringRedisTemplate redisTemplate;
    private final AuthenticationManager authenticationManager;
    private final LoginUserDetailsService loginUserDetailsService;
    private final RefreshTokenService refreshTokenService;
    private final TokenVersionService tokenVersionService;
    private final AuthProperties authProperties;

    public AuthTokenResult login(LoginRequest request, HttpServletRequest servletRequest) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (DisabledException e) {
            throw new BusinessException(1003, "账号已被禁用");
        } catch (AuthenticationException e) {
            throw new BusinessException(ResultCode.USERNAME_OR_PASSWORD_ERROR);
        }
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        String deviceId = StringUtils.hasText(request.deviceId()) ? request.deviceId() : UUID.randomUUID().toString();
        Integer tokenVersion = tokenVersionService.getCurrentTokenVersion(loginUser.getUserId());
        String accessToken = generateAccessToken(loginUser, tokenVersion, deviceId);
        String refreshToken = refreshTokenService.generateRawToken();
        Duration refreshTtl = getRefreshTtl(request.rememberMeEnabled());
        LoginSession session = buildSession(loginUser, deviceId, refreshToken, tokenVersion,
                request.rememberMeEnabled(), servletRequest);
        refreshTokenService.saveSession(session, refreshTtl);
        return new AuthTokenResult(accessToken, authProperties.getAccessTokenExpireMinutes() * 60,
                toUserInfo(loginUser), refreshToken, deviceId, refreshTtl);
    }

    public AuthTokenResult refresh(String rawRefreshToken, HttpServletRequest servletRequest) {
        if (!StringUtils.hasText(rawRefreshToken)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        String incomingHash = refreshTokenService.hash(rawRefreshToken);
        LoginSession session = refreshTokenService.getSessionByRefreshToken(rawRefreshToken);
        if (session == null) {
            if (refreshTokenService.wasRefreshTokenUsed(incomingHash)) {
                throw new BusinessException(ResultCode.REFRESH_TOKEN_INVALID);
            }
            throw new BusinessException(ResultCode.REFRESH_TOKEN_INVALID);
        }
        if (!incomingHash.equals(session.getRefreshTokenHash())) {
            refreshTokenService.deleteSession(session);
            throw new BusinessException(ResultCode.REFRESH_TOKEN_INVALID);
        }
        LoginUser loginUser = (LoginUser) loginUserDetailsService.loadUserByUsername(session.getUsername());
        Integer currentTokenVersion = tokenVersionService.getCurrentTokenVersion(loginUser.getUserId());
        if (!currentTokenVersion.equals(session.getTokenVersion())) {
            refreshTokenService.deleteSession(session);
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        String newAccessToken = generateAccessToken(loginUser, currentTokenVersion, session.getDeviceId());
        String newRefreshToken = refreshTokenService.generateRawToken();
        Duration refreshTtl = Boolean.TRUE.equals(session.getRememberMe())
                ? Duration.ofDays(authProperties.getRememberMeRefreshTokenExpireDays())
                : Duration.ofHours(authProperties.getRefreshTokenExpireHours());
        refreshTokenService.deleteSession(session);
        refreshTokenService.markRefreshTokenUsed(incomingHash, Duration.ofSeconds(authProperties.getRefreshReuseGraceSeconds()));
        session.setRefreshTokenHash(refreshTokenService.hash(newRefreshToken));
        session.setLastRefreshTime(LocalDateTime.now());
        session.setRoles(loginUser.getRoles());
        session.setPermissions(loginUser.getPermissions());
        session.setTokenVersion(currentTokenVersion);
        refreshTokenService.saveSession(session, refreshTtl);
        return new AuthTokenResult(newAccessToken, authProperties.getAccessTokenExpireMinutes() * 60,
                toUserInfo(loginUser), newRefreshToken, session.getDeviceId(), refreshTtl);
    }

    public void logout(String rawRefreshToken, String accessToken) {
        if (StringUtils.hasText(rawRefreshToken)) {
            LoginSession session = refreshTokenService.getSessionByRefreshToken(rawRefreshToken);
            if (session != null) {
                refreshTokenService.deleteSession(session);
            }
        }
        if (StringUtils.hasText(accessToken)) {
            addAccessTokenToBlacklist(accessToken);
        }
    }

    private void addAccessTokenToBlacklist(String accessToken) {
        try {
            Claims claims = jwtTokenUtil.parseToken(accessToken);
            String jti = claims.getId();
            long remainMillis = claims.getExpiration().getTime() - System.currentTimeMillis();
            if (remainMillis > 0) {
                redisTemplate.opsForValue().set(Constants.accessBlacklistKey(jti), "1",
                        Duration.ofMillis(remainMillis));
            }
        } catch (Exception ignored) {
        }
    }

    private String generateAccessToken(LoginUser loginUser, Integer tokenVersion, String deviceId) {
        return jwtTokenUtil.generateAccessToken(loginUser.getUserId(), loginUser.getUsername(),
                loginUser.getRoles(), tokenVersion, deviceId, UUID.randomUUID().toString());
    }

    private LoginSession buildSession(LoginUser loginUser, String deviceId, String rawRefreshToken,
                                      Integer tokenVersion, boolean rememberMe, HttpServletRequest request) {
        LoginSession session = new LoginSession();
        session.setUserId(loginUser.getUserId());
        session.setUsername(loginUser.getUsername());
        session.setDeviceId(deviceId);
        session.setRefreshTokenHash(refreshTokenService.hash(rawRefreshToken));
        session.setLoginIp(getClientIp(request));
        session.setUserAgent(request.getHeader("User-Agent"));
        session.setLoginTime(LocalDateTime.now());
        session.setLastRefreshTime(LocalDateTime.now());
        session.setTokenVersion(tokenVersion);
        session.setRememberMe(rememberMe);
        session.setRoles(loginUser.getRoles());
        session.setPermissions(loginUser.getPermissions());
        return session;
    }

    private UserInfo toUserInfo(LoginUser loginUser) {
        return new UserInfo(loginUser.getUserId(), loginUser.getUsername(), loginUser.getRoles(),
                loginUser.getPermissions());
    }

    private Duration getRefreshTtl(boolean rememberMe) {
        return rememberMe ? Duration.ofDays(authProperties.getRememberMeRefreshTokenExpireDays())
                : Duration.ofHours(authProperties.getRefreshTokenExpireHours());
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}