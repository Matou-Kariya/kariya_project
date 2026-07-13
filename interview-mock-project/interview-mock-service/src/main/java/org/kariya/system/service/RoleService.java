package org.kariya.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.kariya.entity.PageResult;
import org.kariya.exception.BusinessException;
import org.kariya.system.entity.RoleOptionVO;
import org.kariya.system.entity.RoleSaveRequest;
import org.kariya.system.entity.RoleUserCountRow;
import org.kariya.system.entity.RoleVO;
import org.kariya.system.entity.SysMenu;
import org.kariya.system.entity.SysRole;
import org.kariya.system.mapper.SysMenuMapper;
import org.kariya.system.mapper.SysRoleMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final SysRoleMapper sysRoleMapper;
    private final SysMenuMapper sysMenuMapper;

    public PageResult<RoleVO> page(long current, long size, String roleName, String roleKey, Integer status) {
        Page<SysRole> page = new Page<>(Math.max(1, current), Math.min(100, Math.max(1, size)));
        LambdaQueryWrapper<SysRole> query = new LambdaQueryWrapper<SysRole>()
                .like(StringUtils.hasText(roleName), SysRole::getRoleName, trim(roleName))
                .like(StringUtils.hasText(roleKey), SysRole::getRoleKey, trim(roleKey))
                .eq(status != null, SysRole::getStatus, status)
                .orderByDesc(SysRole::getId);
        IPage<SysRole> result = sysRoleMapper.selectPage(page, query);
        List<Long> ids = result.getRecords().stream().map(SysRole::getId).toList();
        Map<Long, Long> counts = new HashMap<>();
        if (!ids.isEmpty()) {
            for (RoleUserCountRow row : sysRoleMapper.selectUserCounts(ids)) {
                counts.put(row.getRoleId(), row.getUserCount());
            }
        }
        List<RoleVO> records = result.getRecords().stream().map(role -> {
            RoleVO value = RoleVO.from(role);
            value.setUserCount(counts.getOrDefault(role.getId(), 0L));
            return value;
        }).toList();
        return PageResult.from(result, records);
    }

    public List<RoleOptionVO> options() {
        return sysRoleMapper.selectList(new LambdaQueryWrapper<SysRole>().orderByAsc(SysRole::getId)).stream()
                .map(role -> new RoleOptionVO(role.getId(), role.getRoleName(), role.getRoleKey()))
                .toList();
    }

    @Transactional
    public Long create(RoleSaveRequest request) {
        validateRequest(request, null);
        LocalDateTime now = LocalDateTime.now();
        SysRole role = new SysRole();
        applyRequest(role, request);
        role.setCreateTime(now);
        role.setUpdateTime(now);
        sysRoleMapper.insert(role);
        return role.getId();
    }

    @Transactional
    public void update(Long id, RoleSaveRequest request) {
        SysRole role = requireRole(id);
        validateRequest(request, id);
        if ("admin".equals(role.getRoleKey()) && !"admin".equals(request.roleKey().trim())) {
            throw new BusinessException(400, "超级管理员角色标识不能修改");
        }
        applyRequest(role, request);
        role.setUpdateTime(LocalDateTime.now());
        sysRoleMapper.updateById(role);
    }

    @Transactional
    public void delete(Long id) {
        SysRole role = requireRole(id);
        if ("admin".equals(role.getRoleKey())) throw new BusinessException(400, "超级管理员角色不能删除");
        if (sysRoleMapper.countUsersByRoleId(id) > 0) throw new BusinessException(400, "请先解除该角色下的用户关联");
        sysRoleMapper.deleteRoleMenus(id);
        sysRoleMapper.deleteById(id);
    }

    public List<Long> getMenuIds(Long roleId) {
        requireRole(roleId);
        return sysRoleMapper.selectMenuIdsByRoleId(roleId);
    }

    @Transactional
    public void assignMenus(Long roleId, List<Long> menuIds) {
        requireRole(roleId);
        List<Long> normalized = normalizeIds(menuIds);
        if (!normalized.isEmpty()) {
            List<SysMenu> allMenus = sysMenuMapper.selectAllMenus();
            Map<Long, SysMenu> menuMap = new HashMap<>();
            allMenus.forEach(menu -> menuMap.put(menu.getId(), menu));
            if (normalized.stream().anyMatch(id -> !menuMap.containsKey(id))) {
                throw new BusinessException(400, "部分菜单不存在或已被删除");
            }

            // 菜单树依赖父级目录。前端只勾选部分子节点时，也必须保存其所有祖先节点。
            LinkedHashSet<Long> expandedIds = new LinkedHashSet<>(normalized);
            for (Long id : normalized) {
                SysMenu current = menuMap.get(id);
                while (current != null && current.getParentId() != null && current.getParentId() != 0) {
                    Long parentId = current.getParentId();
                    if (!expandedIds.add(parentId)) break;
                    current = menuMap.get(parentId);
                }
            }
            normalized = new ArrayList<>(expandedIds);
        }
        sysRoleMapper.deleteRoleMenus(roleId);
        if (!normalized.isEmpty()) sysRoleMapper.insertRoleMenus(roleId, normalized);
    }

    private void validateRequest(RoleSaveRequest request, Long currentId) {
        if (request == null || !StringUtils.hasText(request.roleName())) throw new BusinessException(400, "角色名称不能为空");
        if (!StringUtils.hasText(request.roleKey())) throw new BusinessException(400, "角色标识不能为空");
        String roleName = request.roleName().trim();
        String roleKey = request.roleKey().trim();
        if (roleName.length() > 50 || roleKey.length() > 50) throw new BusinessException(400, "角色名称和标识不能超过 50 个字符");
        if (!roleKey.matches("[A-Za-z][A-Za-z0-9_-]*")) throw new BusinessException(400, "角色标识只能包含字母、数字、下划线和中划线，且必须以字母开头");
        if (request.status() == null || (request.status() != 0 && request.status() != 1)) throw new BusinessException(400, "角色状态不正确");
        long duplicate = sysRoleMapper.selectCount(new LambdaQueryWrapper<SysRole>()
                .and(wrapper -> wrapper.eq(SysRole::getRoleName, roleName).or().eq(SysRole::getRoleKey, roleKey))
                .ne(currentId != null, SysRole::getId, currentId));
        if (duplicate > 0) throw new BusinessException(400, "角色名称或角色标识已存在");
    }

    private void applyRequest(SysRole role, RoleSaveRequest request) {
        role.setRoleName(request.roleName().trim());
        role.setRoleKey(request.roleKey().trim());
        role.setStatus(request.status());
    }

    private SysRole requireRole(Long id) {
        SysRole role = id == null ? null : sysRoleMapper.selectById(id);
        if (role == null) throw new BusinessException(404, "角色不存在或已被删除");
        return role;
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null) return List.of();
        return new ArrayList<>(new LinkedHashSet<>(ids.stream().filter(java.util.Objects::nonNull).toList()));
    }

    private String trim(String value) { return StringUtils.hasText(value) ? value.trim() : null; }
}
