package org.kariya.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtTokenUtil {
    private String secret;
    private Long accessTokenExpireMinutes;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Long userId, String username, List<String> roles,
            Integer tokenVersion, String deviceId, String jti) {
        Date now = new Date();
        Date expireAt = Date.from(LocalDateTime.now().plusMinutes(accessTokenExpireMinutes)
                .atZone(ZoneId.systemDefault()).toInstant());

        return Jwts.builder().id(jti).subject(String.valueOf(userId)).claim("username", username)
                .claim("roles", roles).claim("tokenVersion", tokenVersion).claim("deviceId", deviceId)
                .claim("type", "access").issuedAt(now).expiration(expireAt).signWith(getSigningKey())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }
}