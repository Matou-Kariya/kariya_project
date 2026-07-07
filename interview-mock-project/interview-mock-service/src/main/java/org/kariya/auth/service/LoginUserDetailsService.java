package org.kariya.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.kariya.auth.entity.LoginUser;
import org.kariya.system.entity.SysMenu;
import org.kariya.system.entity.SysUser;
import org.kariya.system.mapper.SysMenuMapper;
import org.kariya.system.mapper.SysRoleMapper;
import org.kariya.system.mapper.SysUserMapper;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class LoginUserDetailsService implements UserDetailsService {
    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final SysMenuMapper sysMenuMapper;

    @Override
    public UserDetails loadUserByUsername(String username) {
        SysUser user = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username)
                        .last("limit 1"));
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        if (!Integer.valueOf(1).equals(user.getStatus())) {
            throw new DisabledException("账号已禁用");
        }
        List<String> roles = sysRoleMapper.selectRoleKeysByUserId(user.getId());
        List<String> permissions = sysMenuMapper.selectMenusByUserId(user.getId()).stream()
                .map(SysMenu::getPermission).filter(Objects::nonNull).filter(permission -> !permission.isBlank())
                .distinct().toList();
        return new LoginUser(user, roles, permissions);
    }
}
