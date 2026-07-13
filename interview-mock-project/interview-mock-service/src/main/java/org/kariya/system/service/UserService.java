package org.kariya.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.service.TokenVersionService;
import org.kariya.entity.PageResult;
import org.kariya.exception.BusinessException;
import org.kariya.system.entity.RoleOptionVO;
import org.kariya.system.entity.SysRole;
import org.kariya.system.entity.SysUser;
import org.kariya.system.entity.UserRoleRow;
import org.kariya.system.entity.UserSaveRequest;
import org.kariya.system.entity.UserVO;
import org.kariya.system.mapper.SysRoleMapper;
import org.kariya.system.mapper.SysUserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
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
public class    UserService {
    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final PasswordEncoder passwordEncoder;
    private final TokenVersionService tokenVersionService;

    public PageResult<UserVO> page(long current, long size, String username, String nickname, Integer status) {
        Page<SysUser> page = new Page<>(normalizeCurrent(current), normalizeSize(size));
        LambdaQueryWrapper<SysUser> query = new LambdaQueryWrapper<SysUser>()
                .like(StringUtils.hasText(username), SysUser::getUsername, trim(username))
                .like(StringUtils.hasText(nickname), SysUser::getNickname, trim(nickname))
                .eq(status != null, SysUser::getStatus, status)
                .orderByDesc(SysUser::getId);
        IPage<SysUser> result = sysUserMapper.selectPage(page, query);
        return PageResult.from(result, attachRoles(result.getRecords()));
    }

    public UserVO get(Long id) {
        return attachRoles(List.of(requireUser(id))).get(0);
    }

    public PageResult<UserVO> pageByRole(Long roleId, long current, long size, String username, String nickname,
                                         boolean availableOnly) {
        requireRole(roleId);
        Page<SysUser> page = new Page<>(normalizeCurrent(current), normalizeSize(size));
        IPage<SysUser> result = availableOnly
                ? sysUserMapper.selectAvailableUsers(page, roleId, trim(username), trim(nickname))
                : sysUserMapper.selectUsersByRole(page, roleId, trim(username), trim(nickname));
        return PageResult.from(result, attachRoles(result.getRecords()));
    }

    @Transactional
    public Long create(UserSaveRequest request) {
        validateRequest(request, null);
        LocalDateTime now = LocalDateTime.now();
        SysUser user = new SysUser();
        applyRequest(user, request, true);
        user.setCreateTime(now);
        user.setUpdateTime(now);
        sysUserMapper.insert(user);
        replaceRoles(user.getId(), request.roleIds());
        return user.getId();
    }

    @Transactional
    public void update(Long id, UserSaveRequest request, Long operatorId) {
        SysUser existing = requireUser(id);
        validateRequest(request, id);
        if (id.equals(operatorId) && Integer.valueOf(0).equals(request.status())) {
            throw new BusinessException(400, "不能禁用当前登录账号");
        }

        applyRequest(existing, request, false);
        existing.setUpdateTime(LocalDateTime.now());
        sysUserMapper.updateById(existing);
        replaceRoles(id, request.roleIds());
        tokenVersionService.increaseTokenVersion(id);
    }

    @Transactional
    public void delete(Long id, Long operatorId) {
        if (id.equals(operatorId)) {
            throw new BusinessException(400, "不能删除当前登录账号");
        }
        requireUser(id);
        sysUserMapper.deleteUserRoles(id);
        sysUserMapper.deleteById(id);
    }

    @Transactional
    public void addUsersToRole(Long roleId, List<Long> userIds) {
        requireRole(roleId);
        List<Long> normalized = normalizeIds(userIds);
        if (normalized.isEmpty()) {
            throw new BusinessException(400, "请选择需要添加的用户");
        }
        long userCount = sysUserMapper.selectCount(new LambdaQueryWrapper<SysUser>().in(SysUser::getId, normalized));
        if (userCount != normalized.size()) {
            throw new BusinessException(400, "部分用户不存在或已被删除");
        }
        sysUserMapper.addUsersToRole(roleId, normalized);
        normalized.forEach(tokenVersionService::increaseTokenVersion);
    }

    @Transactional
    public void removeUserFromRole(Long roleId, Long userId) {
        requireRole(roleId);
        requireUser(userId);
        sysUserMapper.deleteUserRole(userId, roleId);
        tokenVersionService.increaseTokenVersion(userId);
    }

    private List<UserVO> attachRoles(List<SysUser> users) {
        if (users.isEmpty()) return List.of();
        List<Long> userIds = users.stream().map(SysUser::getId).toList();
        Map<Long, List<RoleOptionVO>> roleMap = new HashMap<>();
        for (UserRoleRow row : sysUserMapper.selectRoleRowsByUserIds(userIds)) {
            roleMap.computeIfAbsent(row.getUserId(), key -> new ArrayList<>())
                    .add(new RoleOptionVO(row.getRoleId(), row.getRoleName(), row.getRoleKey()));
        }
        return users.stream().map(user -> {
            UserVO result = UserVO.from(user);
            result.setRoles(roleMap.getOrDefault(user.getId(), List.of()));
            return result;
        }).toList();
    }

    private void validateRequest(UserSaveRequest request, Long currentId) {
        if (request == null || !StringUtils.hasText(request.username())) {
            throw new BusinessException(400, "用户名不能为空");
        }
        String username = request.username().trim();
        if (username.length() > 50) throw new BusinessException(400, "用户名不能超过 50 个字符");
        if (currentId == null && !StringUtils.hasText(request.password())) {
            throw new BusinessException(400, "新增用户时密码不能为空");
        }
        if (StringUtils.hasText(request.password()) && request.password().length() < 8) {
            throw new BusinessException(400, "密码长度不能少于 8 位");
        }
        if (request.status() == null || (request.status() != 0 && request.status() != 1)) {
            throw new BusinessException(400, "用户状态不正确");
        }
        Long duplicate = sysUserMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, username)
                .ne(currentId != null, SysUser::getId, currentId));
        if (duplicate > 0) throw new BusinessException(400, "用户名已存在");
        validateRoles(request.roleIds());
    }

    private void validateRoles(List<Long> roleIds) {
        List<Long> normalized = normalizeIds(roleIds);
        if (normalized.isEmpty()) return;
        long count = sysRoleMapper.selectCount(new LambdaQueryWrapper<SysRole>().in(SysRole::getId, normalized));
        if (count != normalized.size()) throw new BusinessException(400, "部分角色不存在或已被删除");
    }

    private void applyRequest(SysUser user, UserSaveRequest request, boolean creating) {
        user.setUsername(request.username().trim());
        if (creating || StringUtils.hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        user.setNickname(nullableTrim(request.nickname()));
        user.setAvatar(nullableTrim(request.avatar()));
        user.setEmail(nullableTrim(request.email()));
        user.setPhone(nullableTrim(request.phone()));
        user.setStatus(request.status());
    }

    private void replaceRoles(Long userId, List<Long> roleIds) {
        sysUserMapper.deleteUserRoles(userId);
        List<Long> normalized = normalizeIds(roleIds);
        if (!normalized.isEmpty()) sysUserMapper.insertUserRoles(userId, normalized);
    }

    private SysUser requireUser(Long id) {
        SysUser user = id == null ? null : sysUserMapper.selectById(id);
        if (user == null) throw new BusinessException(404, "用户不存在或已被删除");
        return user;
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

    private long normalizeCurrent(long current) { return Math.max(1, current); }
    private long normalizeSize(long size) { return Math.min(100, Math.max(1, size)); }
    private String trim(String value) { return StringUtils.hasText(value) ? value.trim() : null; }
    private String nullableTrim(String value) { return StringUtils.hasText(value) ? value.trim() : null; }
}
