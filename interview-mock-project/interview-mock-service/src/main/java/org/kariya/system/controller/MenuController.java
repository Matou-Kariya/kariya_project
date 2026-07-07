package org.kariya.system.controller;

import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.LoginUser;
import org.kariya.entity.Result;
import org.kariya.system.entity.MenuVO;
import org.kariya.system.service.MenuService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
