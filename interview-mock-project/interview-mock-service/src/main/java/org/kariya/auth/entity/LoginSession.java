package org.kariya.auth.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class LoginSession {
    private Long userId;
    private String username;
    private String deviceId;
    private String refreshTokenHash;
    private String loginIp;
    private String userAgent;
    private LocalDateTime loginTime;
    private LocalDateTime lastRefreshTime;
    private Integer tokenVersion;
    private Boolean rememberMe;
    private List<String> roles;
    private List<String> permissions;
}
