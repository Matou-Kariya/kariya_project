package org.kariya.system.controller;

import lombok.RequiredArgsConstructor;
import org.kariya.entity.PageResult;
import org.kariya.entity.Result;
import org.kariya.system.entity.IdListRequest;
import org.kariya.system.entity.RoleOptionVO;
import org.kariya.system.entity.RoleSaveRequest;
import org.kariya.system.entity.RoleVO;
import org.kariya.system.entity.UserVO;
import org.kariya.system.service.RoleService;
import org.kariya.system.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/system/role")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;
    private final UserService userService;

    @GetMapping("/page")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:list')")
    public Result<PageResult<RoleVO>> page(
            @RequestParam(defaultValue = "1") long current,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String roleKey,
            @RequestParam(required = false) Integer status) {
        return Result.success(roleService.page(current, size, roleName, roleKey, status));
    }

    @GetMapping("/options")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:user:list') or hasAuthority('system:role:list')")
    public Result<List<RoleOptionVO>> options() {
        return Result.success(roleService.options());
    }

    @PostMapping
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:create')")
    public Result<Long> create(@RequestBody RoleSaveRequest request) {
        return Result.success(roleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:update')")
    public Result<Void> update(@PathVariable Long id, @RequestBody RoleSaveRequest request) {
        roleService.update(id, request);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return Result.success();
    }

    @GetMapping("/{roleId}/users")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:users')")
    public Result<PageResult<UserVO>> users(
            @PathVariable Long roleId,
            @RequestParam(defaultValue = "1") long current,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String nickname) {
        return Result.success(userService.pageByRole(roleId, current, size, username, nickname, false));
    }

    @GetMapping("/{roleId}/available-users")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:users')")
    public Result<PageResult<UserVO>> availableUsers(
            @PathVariable Long roleId,
            @RequestParam(defaultValue = "1") long current,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String nickname) {
        return Result.success(userService.pageByRole(roleId, current, size, username, nickname, true));
    }

    @PostMapping("/{roleId}/users")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:users')")
    public Result<Void> addUsers(@PathVariable Long roleId, @RequestBody IdListRequest request) {
        userService.addUsersToRole(roleId, request.ids());
        return Result.success();
    }

    @DeleteMapping("/{roleId}/users/{userId}")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:users')")
    public Result<Void> removeUser(@PathVariable Long roleId, @PathVariable Long userId) {
        userService.removeUserFromRole(roleId, userId);
        return Result.success();
    }

    @GetMapping("/{roleId}/menus")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:grant')")
    public Result<List<Long>> menuIds(@PathVariable Long roleId) {
        return Result.success(roleService.getMenuIds(roleId));
    }

    @PutMapping("/{roleId}/menus")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:role:grant')")
    public Result<Void> assignMenus(@PathVariable Long roleId, @RequestBody IdListRequest request) {
        roleService.assignMenus(roleId, request.ids());
        return Result.success();
    }
}
