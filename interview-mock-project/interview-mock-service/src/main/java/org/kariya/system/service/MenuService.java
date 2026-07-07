package org.kariya.system.service;

import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.LoginUser;
import org.kariya.system.entity.MenuVO;
import org.kariya.system.entity.SysMenu;
import org.kariya.system.mapper.SysMenuMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MenuService {
    private final SysMenuMapper sysMenuMapper;

    public List<MenuVO> getUserMenuTree(LoginUser loginUser) {
        List<SysMenu> menus;
        if (loginUser.getRoles().contains("admin")) {
            menus = sysMenuMapper.selectAllEnabledMenus();
        } else {
            menus = sysMenuMapper.selectMenusByUserId(loginUser.getUserId());
        }
        return buildMenuTree(menus);
    }

    private List<MenuVO> buildMenuTree(List<SysMenu> menus) {
        Map<Long, MenuVO> map = new LinkedHashMap<>();
        for (SysMenu menu : menus) {
            map.put(menu.getId(), MenuVO.from(menu));
        }
        List<MenuVO> roots = new ArrayList<>();
        for (MenuVO menu : map.values()) {
            if (menu.getParentId() == null || menu.getParentId() == 0) {
                roots.add(menu);
            } else {
                MenuVO parent = map.get(menu.getParentId());
                if (parent != null) {
                    parent.getChildren().add(menu);
                }
            }
        }
        for (MenuVO root : roots) {
            fillFullPath(root, "");
        }
        return roots;
    }

    private void fillFullPath(MenuVO menu, String parentPath) {
        String currentPath = normalizePath(parentPath, menu.getPath());
        menu.setPath(currentPath);
        for (MenuVO child : menu.getChildren()) {
            fillFullPath(child, currentPath);
        }
    }

    private String normalizePath(String parentPath, String path) {
        if (path == null || path.isBlank()) {
            return parentPath;
        }
        if (path.startsWith("/")) {
            return path;
        }
        if (parentPath == null || parentPath.isBlank() || "/".equals(parentPath)) {
            return "/" + path;
        }
        return parentPath + "/" + path;
    }
}
