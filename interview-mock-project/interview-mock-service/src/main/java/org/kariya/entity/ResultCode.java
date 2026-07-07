package org.kariya.entity;

import lombok.Getter;

@Getter
public enum ResultCode {
    SUCCESS(0, "success"),

    FAIL(500, "系统异常"),

    PARAM_ERROR(400, "参数错误"),

    UNAUTHORIZED(401, "登录已过期，请重新登录"),

    FORBIDDEN(403, "没有权限访问"),

    NOT_FOUND(404, "资源不存在"),

    USERNAME_OR_PASSWORD_ERROR(1001, "账号或密码错误"),

    REFRESH_TOKEN_INVALID(1002, "刷新令牌已失效");

    private final Integer code;

    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
