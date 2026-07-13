package org.kariya.system.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoleVO {
    private Long id;
    private String roleName;
    private String roleKey;
    private Integer status;
    private long userCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public static RoleVO from(SysRole role) {
        RoleVO result = new RoleVO();
        result.setId(role.getId());
        result.setRoleName(role.getRoleName());
        result.setRoleKey(role.getRoleKey());
        result.setStatus(role.getStatus());
        result.setCreateTime(role.getCreateTime());
        result.setUpdateTime(role.getUpdateTime());
        return result;
    }
}
