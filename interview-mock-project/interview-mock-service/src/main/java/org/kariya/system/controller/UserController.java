package org.kariya.system.controller;

import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.LoginUser;
import org.kariya.entity.PageResult;
import org.kariya.entity.Result;
import org.kariya.system.entity.UserSaveRequest;
import org.kariya.system.entity.UserVO;
import org.kariya.system.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/page")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:user:list')")
    public Result<PageResult<UserVO>> page(
            @RequestParam(defaultValue = "1") long current,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) Integer status) {
        return Result.success(userService.page(current, size, username, nickname, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:user:list')")
    public Result<UserVO> get(@PathVariable Long id) {
        return Result.success(userService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('admin') or hasAuthority('system:user:create')")
    public Result<Long> create(@RequestBody UserSaveRequest request) {
        return Result.success(userService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:user:update')")
    public Result<Void> update(@PathVariable Long id, @RequestBody UserSaveRequest request,
                               @AuthenticationPrincipal LoginUser loginUser) {
        userService.update(id, request, loginUser.getUserId());
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:user:delete')")
    public Result<Void> delete(@PathVariable Long id, @AuthenticationPrincipal LoginUser loginUser) {
        userService.delete(id, loginUser.getUserId());
        return Result.success();
    }
}
