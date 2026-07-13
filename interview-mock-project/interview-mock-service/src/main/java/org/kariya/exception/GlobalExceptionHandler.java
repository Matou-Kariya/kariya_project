package org.kariya.exception;

import lombok.extern.slf4j.Slf4j;
import org.kariya.entity.Result;
import org.kariya.entity.ResultCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusinessException(BusinessException exception) {
        return ResponseEntity.status(resolveStatus(exception.getCode()))
                .body(Result.fail(exception.getCode(), exception.getError(), exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Void>> handleValidException(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().isEmpty()
                ? ResultCode.PARAM_ERROR.getMessage()
                : exception.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        return ResponseEntity.badRequest().body(Result.fail(
                ResultCode.PARAM_ERROR.getCode(), ResultCode.PARAM_ERROR.getError(), message));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Result<Void>> handleAccessDeniedException() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Result.fail(ResultCode.FORBIDDEN));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleException(Exception exception) {
        log.error("Unhandled server exception", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Result.fail(ResultCode.FAIL));
    }

    private HttpStatus resolveStatus(Integer code) {
        if (code == null) return HttpStatus.INTERNAL_SERVER_ERROR;
        if (code == 400) return HttpStatus.BAD_REQUEST;
        if (code == 401 || code == 1001 || code == 1002 || code == 1003) return HttpStatus.UNAUTHORIZED;
        if (code == 403) return HttpStatus.FORBIDDEN;
        if (code == 404) return HttpStatus.NOT_FOUND;
        if (code >= 500) return HttpStatus.INTERNAL_SERVER_ERROR;
        return HttpStatus.BAD_REQUEST;
    }
}
