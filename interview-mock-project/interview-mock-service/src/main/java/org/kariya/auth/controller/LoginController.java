package org.kariya.auth.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.*;
import org.kariya.auth.service.AuthService;
import org.kariya.entity.Result;
import org.kariya.entity.ResultCode;
import org.kariya.exception.BusinessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class LoginController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(loginRequest);
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie
                .from("refreshToken", loginResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false) // 本地开发用 false，https 生产环境改 true
                .sameSite("Lax")
                .path("/");

        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());

        loginResponse.setRefreshToken(null);
        return Result.success(loginResponse);
    }

    @PostMapping("/refresh")
    public Result<LoginResponse> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        LoginResponse loginResponse = authService.refresh(refreshToken);
        loginResponse.setRefreshToken(null);
        return Result.success(loginResponse);
    }

    @PostMapping("/logout")
    public Result<Void> logout(@RequestBody LogoutRequest request) {
        authService.logout(request.accessToken(), request.refreshToken());
        return Result.success();
    }

    @GetMapping("/me")
    public Result<UserInfo> me(@AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(new UserInfo(loginUser.getUserId(), loginUser.getUsername(), loginUser.getRoles()));
    }
}
