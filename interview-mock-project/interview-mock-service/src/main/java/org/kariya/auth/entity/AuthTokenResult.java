package org.kariya.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthTokenResult {
    private String accessToken;
    private Long expiresIn;
    private UserInfo userInfo;
    private String refreshToken;
    private String deviceId;
    private Duration refreshTtl;
}