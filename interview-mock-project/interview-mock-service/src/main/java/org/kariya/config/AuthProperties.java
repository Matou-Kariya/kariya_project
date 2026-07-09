package org.kariya.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "auth")
public class AuthProperties {
    private long accessTokenExpireMinutes = 15;
    private long refreshTokenExpireHours = 8;
    private long rememberMeRefreshTokenExpireDays = 14;

    private String refreshTokenCookieName = "refresh_token";
    private String deviceIdCookieName = "device_id";
    private String refreshTokenCookiePath = "/auth";

    private boolean cookieSecure = false;
    private String cookieSameSite = "Lax";

    /**
     * Refresh Token Rotation 并发宽限秒数。
     * 多标签页同时刷新时，短时间内允许旧 token 使用一次，避免误踢。
     * 如果你希望强安全，可设为 0。
     */
    private long refreshReuseGraceSeconds = 5;

}
