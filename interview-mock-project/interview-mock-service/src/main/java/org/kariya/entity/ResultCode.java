package org.kariya.entity;

import lombok.Getter;

@Getter
public enum ResultCode {
    SUCCESS(0, null, "success"),
    FAIL(500, "INTERNAL_ERROR", "系统异常"),
    PARAM_ERROR(400, "PARAM_ERROR", "参数错误"),
    UNAUTHORIZED(401, "UNAUTHORIZED", "请先登录"),
    TOKEN_EXPIRED(401, "TOKEN_EXPIRED", "登录已过期，请重新登录"),
    TOKEN_INVALID(401, "TOKEN_INVALID", "登录凭证无效，请重新登录"),
    FORBIDDEN(403, "ACCESS_DENIED", "没有权限访问"),
    NOT_FOUND(404, "NOT_FOUND", "资源不存在"),
    USERNAME_OR_PASSWORD_ERROR(1001, "USERNAME_OR_PASSWORD_ERROR", "账号或密码错误"),
    REFRESH_TOKEN_INVALID(1002, "REFRESH_TOKEN_INVALID", "刷新令牌已失效"),
    USER_DISABLED(1003, "USER_DISABLED", "账号已被禁用");

    private final Integer code;
    private final String error;
    private final String message;

    ResultCode(Integer code, String error, String message) {
        this.code = code;
        this.error = error;
        this.message = message;
    }
}
