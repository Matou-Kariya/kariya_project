package org.kariya.auth.entity;

public record LoginRequest(
        String username,
        String password,
        Boolean rememberMe
) {
    public boolean rememberMeEnabled() {
        return Boolean.TRUE.equals(rememberMe);
    }
}
