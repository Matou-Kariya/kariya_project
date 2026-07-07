package org.kariya.auth.entity;

public record LogoutRequest(
        String accessToken,
        String refreshToken
) {
}
