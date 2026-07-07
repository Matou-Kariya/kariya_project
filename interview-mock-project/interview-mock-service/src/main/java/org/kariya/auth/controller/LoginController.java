package org.kariya.auth.controller;

import org.kariya.auth.entity.LoginRequest;
import org.kariya.auth.entity.LoginResponse;
import org.kariya.auth.entity.LogoutRequest;
import org.kariya.auth.entity.RefreshTokenRequest;
import org.kariya.auth.service.AuthService;
import org.kariya.entity.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class LoginController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        return Result.success(authService.login(loginRequest));
    }

    @PostMapping("/refresh")
    public Result<LoginResponse> refresh(@RequestBody RefreshTokenRequest request) {
        return Result.success(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    public Result<Void> logout(@RequestBody LogoutRequest request) {
        authService.logout(request.accessToken(), request.refreshToken());
        return Result.success();
    }
}
