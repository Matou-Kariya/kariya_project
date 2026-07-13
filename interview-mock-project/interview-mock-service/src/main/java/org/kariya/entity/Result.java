package org.kariya.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Result<T> {
    private Integer code;
    private String error;
    private String message;
    private T data;

    public Result(Integer code, String error, String message, T data) {
        this.code = code;
        this.error = error;
        this.message = message;
        this.data = data;
    }

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), null, ResultCode.SUCCESS.getMessage(), data);
    }

    public static <T> Result<T> success(String message, T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), null, message, data);
    }

    public static <T> Result<T> fail() {
        return fail(ResultCode.FAIL);
    }

    public static <T> Result<T> fail(String message) {
        return new Result<>(ResultCode.FAIL.getCode(), ResultCode.FAIL.getError(), message, null);
    }

    public static <T> Result<T> fail(Integer code, String message) {
        return new Result<>(code, "BUSINESS_ERROR", message, null);
    }

    public static <T> Result<T> fail(Integer code, String error, String message) {
        return new Result<>(code, error, message, null);
    }

    public static <T> Result<T> fail(ResultCode resultCode) {
        return new Result<>(resultCode.getCode(), resultCode.getError(), resultCode.getMessage(), null);
    }
}
