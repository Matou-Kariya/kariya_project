package org.kariya.system.controller;

import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.LoginUser;
import org.kariya.entity.Result;
import org.kariya.system.entity.MenuSaveRequest;
import org.kariya.system.entity.MenuVO;
import org.kariya.system.service.MenuService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/system/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/user")
    public Result<List<MenuVO>> getUserMenus(@AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(menuService.getUserMenuTree(loginUser));
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:menu:list') or hasAuthority('system:role:grant')")
    public Result<List<MenuVO>> getMenuList() {
        return Result.success(menuService.getMenuTree());
    }

    @PostMapping
    @PreAuthorize("hasRole('admin') or hasAuthority('system:menu:list')")
    public Result<Long> createMenu(@RequestBody MenuSaveRequest request) {
        return Result.success(menuService.createMenu(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:menu:list')")
    public Result<Void> updateMenu(@PathVariable Long id, @RequestBody MenuSaveRequest request) {
        menuService.updateMenu(id, request);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasAuthority('system:menu:list')")
    public Result<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return Result.success();
    }
}
