package org.kariya.system.service;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.LoginUser;
import org.kariya.exception.BusinessException;
import org.kariya.system.entity.MenuSaveRequest;
import org.kariya.system.entity.MenuVO;
import org.kariya.system.entity.SysMenu;
import org.kariya.system.mapper.SysMenuMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
        return buildMenuTree(menus, true);
    }

    public List<MenuVO> getMenuTree() {
        return buildMenuTree(sysMenuMapper.selectAllMenus(), false);
    }

    @Transactional
    public Long createMenu(MenuSaveRequest request) {
        validateRequest(request, null);

        LocalDateTime now = LocalDateTime.now();
        SysMenu menu = new SysMenu();
        applyRequest(menu, request);
        menu.setCreateTime(now);
        menu.setUpdateTime(now);
        sysMenuMapper.insert(menu);
        return menu.getId();
    }

    @Transactional
    public void updateMenu(Long id, MenuSaveRequest request) {
        SysMenu existing = requireMenu(id);
        validateRequest(request, id);

        if (sysMenuMapper.countChildren(id) > 0 && Integer.valueOf(2).equals(request.menuType())) {
            throw new BusinessException(400, "存在子节点的菜单不能设置为按钮权限");
        }

        SysMenu values = new SysMenu();
        applyRequest(values, request);

        LambdaUpdateWrapper<SysMenu> update = new LambdaUpdateWrapper<SysMenu>()
                .eq(SysMenu::getId, existing.getId())
                .set(SysMenu::getParentId, values.getParentId())
                .set(SysMenu::getMenuName, values.getMenuName())
                .set(SysMenu::getPath, values.getPath())
                .set(SysMenu::getComponent, values.getComponent())
                .set(SysMenu::getIcon, values.getIcon())
                .set(SysMenu::getMenuType, values.getMenuType())
                .set(SysMenu::getPermission, values.getPermission())
                .set(SysMenu::getOrderNum, values.getOrderNum())
                .set(SysMenu::getStatus, values.getStatus())
                .set(SysMenu::getUpdateTime, LocalDateTime.now());

        sysMenuMapper.update(null, update);
    }

    @Transactional
    public void deleteMenu(Long id) {
        requireMenu(id);
        if (sysMenuMapper.countChildren(id) > 0) {
            throw new BusinessException(400, "请先删除该菜单下的子菜单");
        }
        sysMenuMapper.deleteRoleMenuRelations(id);
        sysMenuMapper.deleteById(id);
    }

    private List<MenuVO> buildMenuTree(List<SysMenu> menus, boolean resolveFullPath) {
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
        if (resolveFullPath) {
            for (MenuVO root : roots) {
                fillFullPath(root, "");
            }
        }
        return roots;
    }

    private void validateRequest(MenuSaveRequest request, Long currentId) {
        if (request == null) {
            throw new BusinessException(400, "菜单参数不能为空");
        }
        if (!StringUtils.hasText(request.menuName())) {
            throw new BusinessException(400, "菜单名称不能为空");
        }
        if (request.menuName().trim().length() > 50) {
            throw new BusinessException(400, "菜单名称不能超过 50 个字符");
        }
        if (request.menuType() == null || request.menuType() < 0 || request.menuType() > 2) {
            throw new BusinessException(400, "菜单类型不正确");
        }
        if (request.status() == null || (request.status() != 0 && request.status() != 1)) {
            throw new BusinessException(400, "菜单状态不正确");
        }
        if (request.orderNum() == null || request.orderNum() < 0) {
            throw new BusinessException(400, "显示排序不能小于 0");
        }
        if (request.menuType() != 2 && !StringUtils.hasText(request.path())) {
            throw new BusinessException(400, "目录和菜单页面必须填写路由地址");
        }
        if (request.menuType() == 1 && !StringUtils.hasText(request.component())) {
            throw new BusinessException(400, "菜单页面必须填写组件路径");
        }
        if (request.menuType() == 2 && !StringUtils.hasText(request.permission())) {
            throw new BusinessException(400, "按钮权限必须填写权限标识");
        }

        Long parentId = normalizeParentId(request.parentId());
        if (currentId != null && currentId.equals(parentId)) {
            throw new BusinessException(400, "菜单不能选择自身作为上级");
        }
        if (parentId != 0L) {
            SysMenu parent = requireMenu(parentId);
            if (Integer.valueOf(2).equals(parent.getMenuType())) {
                throw new BusinessException(400, "按钮权限不能作为上级菜单");
            }
            ensureNoParentCycle(currentId, parentId);
        }
    }

    private void ensureNoParentCycle(Long currentId, Long parentId) {
        if (currentId == null) {
            return;
        }
        Set<Long> visited = new HashSet<>();
        Long cursor = parentId;
        while (cursor != null && cursor != 0L) {
            if (!visited.add(cursor) || currentId.equals(cursor)) {
                throw new BusinessException(400, "不能将菜单移动到自己的下级目录");
            }
            SysMenu parent = sysMenuMapper.selectById(cursor);
            if (parent == null) {
                break;
            }
            cursor = normalizeParentId(parent.getParentId());
        }
    }

    private SysMenu requireMenu(Long id) {
        if (id == null) {
            throw new BusinessException(400, "菜单 ID 不能为空");
        }
        SysMenu menu = sysMenuMapper.selectById(id);
        if (menu == null) {
            throw new BusinessException(404, "菜单不存在或已被删除");
        }
        return menu;
    }

    private void applyRequest(SysMenu menu, MenuSaveRequest request) {
        int type = request.menuType();
        menu.setParentId(normalizeParentId(request.parentId()));
        menu.setMenuName(request.menuName().trim());
        menu.setPath(type == 2 ? "" : request.path().trim());
        menu.setComponent(type == 1 ? nullableTrim(request.component()) : null);
        menu.setIcon(type == 2 ? null : nullableTrim(request.icon()));
        menu.setMenuType(type);
        menu.setPermission(type == 0 ? null : nullableTrim(request.permission()));
        menu.setOrderNum(request.orderNum());
        menu.setStatus(request.status());
    }

    private Long normalizeParentId(Long parentId) {
        return parentId == null ? 0L : parentId;
    }

    private String nullableTrim(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
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
