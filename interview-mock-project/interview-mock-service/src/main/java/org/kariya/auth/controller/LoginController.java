package org.kariya.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.*;
import org.kariya.auth.service.AuthService;
import org.kariya.config.AuthProperties;
import org.kariya.entity.Result;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class LoginController {
    private final AuthService authService;
    private final AuthProperties authProperties;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request,
                                       HttpServletResponse response) {
        AuthTokenResult result = authService.login(loginRequest, request);
        setRefreshCookie(response, result.getRefreshToken(), result.getRefreshTtl());
        setDeviceCookie(response, result.getDeviceId(), result.getRefreshTtl());
        return Result.success(toResponse(result));
    }

    @PostMapping("/refresh")
    public Result<LoginResponse> refresh(@CookieValue(value = "refresh_token", required = false) String refreshToken,
                                         HttpServletRequest request, HttpServletResponse response) {
        AuthTokenResult result = authService.refresh(refreshToken, request);
        setRefreshCookie(response, result.getRefreshToken(), result.getRefreshTtl());
        setDeviceCookie(response, result.getDeviceId(), result.getRefreshTtl());
        return Result.success(toResponse(result));
    }

    @PostMapping("/logout") 
    public Result<Void> logout(@CookieValue(value = "refresh_token", required = false) String refreshToken,
                               HttpServletRequest request, HttpServletResponse response) {
        String accessToken = resolveBearerToken(request);
        authService.logout(refreshToken, accessToken);
        clearRefreshCookie(response);
        clearDeviceCookie(response);

        return Result.success();
    }

    @GetMapping("/me")
    public Result<UserInfo> me(@AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(new UserInfo(loginUser.getUserId(), loginUser.getUsername(),
                loginUser.getRoles(), loginUser.getPermissions()));
    }

    private LoginResponse toResponse(AuthTokenResult result) {
        return new LoginResponse(result.getAccessToken(), result.getExpiresIn(), result.getUserInfo());
    }

    private String resolveBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(authorization) || !authorization.startsWith("Bearer ")) {
            return null;
        }
        return authorization.substring(7);
    }

    private void setRefreshCookie(HttpServletResponse response, String rawRefreshToken, Duration ttl) {
        ResponseCookie cookie = ResponseCookie.from(authProperties.getRefreshTokenCookieName(), rawRefreshToken)
                .httpOnly(true).secure(authProperties.isCookieSecure()).sameSite(authProperties.getCookieSameSite())
                .path(authProperties.getRefreshTokenCookiePath()).maxAge(ttl).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(authProperties.getRefreshTokenCookieName(), "")
                .httpOnly(true).secure(authProperties.isCookieSecure()).sameSite(authProperties.getCookieSameSite())
                .path(authProperties.getRefreshTokenCookiePath()).maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void setDeviceCookie(HttpServletResponse response, String deviceId, Duration ttl) {
        ResponseCookie cookie = ResponseCookie.from(authProperties.getDeviceIdCookieName(), deviceId)
                .httpOnly(false).secure(authProperties.isCookieSecure()).sameSite(authProperties.getCookieSameSite())
                .path(authProperties.getRefreshTokenCookiePath()).maxAge(ttl).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearDeviceCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(authProperties.getDeviceIdCookieName(), "")
                .httpOnly(false).secure(authProperties.isCookieSecure()).sameSite(authProperties.getCookieSameSite())
                .path(authProperties.getRefreshTokenCookiePath()).maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}