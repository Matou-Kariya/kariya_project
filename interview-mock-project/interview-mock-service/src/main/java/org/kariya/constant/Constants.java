package org.kariya.constant;

public class Constants {

    public static final String LOGIN_SESSION_PREFIX = "login:session:";
    public static final String REFRESH_INDEX_PREFIX = "login:refresh:index:";
    public static final String REFRESH_USED_PREFIX = "login:refresh:used:";
    public static final String ACCESS_BLACKLIST_PREFIX = "token:blacklist:";
    public static final String USER_TOKEN_VERSION_PREFIX = "user:tokenVersion:";

    public static String loginSessionKey(Long userId, String deviceId) {
        return LOGIN_SESSION_PREFIX + userId + ":" + deviceId;
    }

    public static String refreshIndexKey(String refreshTokenHash) {
        return REFRESH_INDEX_PREFIX + refreshTokenHash;
    }

    public static String refreshUsedKey(String refreshTokenHash) {
        return REFRESH_USED_PREFIX + refreshTokenHash;
    }

    public static String accessBlacklistKey(String jti) {
        return ACCESS_BLACKLIST_PREFIX + jti;
    }

    public static String userTokenVersionKey(Long userId) {
        return USER_TOKEN_VERSION_PREFIX + userId;
    }
}
