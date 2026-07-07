package org.kariya.constant;

public class Constants {

    public static final String REFRESH_TOKEN_PREFIX = "auth:refresh:";
    public static final String ACCESS_BLACKLIST_PREFIX = "auth:blacklist:access:";

    public static String refreshTokenKey(String jti) {
        return REFRESH_TOKEN_PREFIX + jti;
    }

    public static String accessBlacklistKey(String jti) {
        return ACCESS_BLACKLIST_PREFIX + jti;
    }
}
