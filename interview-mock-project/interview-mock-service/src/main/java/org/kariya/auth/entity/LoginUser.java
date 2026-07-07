package org.kariya.auth.entity;

import lombok.Getter;
import org.kariya.system.entity.SysUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
public class LoginUser implements UserDetails {
    private final SysUser user;
    private final List<String> roles;
    private final List<String> permissions;
    private final List<GrantedAuthority> authorities;

    public LoginUser(SysUser user, List<String> roles, List<String> permissions) {
        this.user = user;
        this.roles = roles;
        this.permissions = permissions;
        List<GrantedAuthority> list = new ArrayList<>();
        for (String role : roles) {
            list.add(new SimpleGrantedAuthority("ROLE_" + role));
        }
        for (String permission : permissions) {
            list.add(new SimpleGrantedAuthority(permission));
        }
        this.authorities = list;
    }

    public Long getUserId() {
        return user.getId();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
}
