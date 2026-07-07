package org.kariya.auth.controller;

import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.*;
import org.kariya.auth.service.AuthService;
import org.kariya.entity.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class LoginController {

    private final AuthService authService;

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

    @GetMapping("/me")
    public Result<UserInfo> me(@AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(new UserInfo(loginUser.getUserId(), loginUser.getUsername(), loginUser.getRoles()));
    }
}
