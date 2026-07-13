package org.kariya.exception;

import lombok.Getter;
import org.kariya.entity.ResultCode;

@Getter
public class BusinessException extends RuntimeException {

    private final Integer code;
    private final String error;

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
        this.error = resultCode.getError();
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
        this.error = "BUSINESS_ERROR";
    }
}
