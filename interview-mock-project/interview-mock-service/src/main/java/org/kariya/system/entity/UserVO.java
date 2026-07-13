package org.kariya.system.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class UserVO {
    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private String email;
    private String phone;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<RoleOptionVO> roles = new ArrayList<>();

    public static UserVO from(SysUser user) {
        UserVO result = new UserVO();
        result.setId(user.getId());
        result.setUsername(user.getUsername());
        result.setNickname(user.getNickname());
        result.setAvatar(user.getAvatar());
        result.setEmail(user.getEmail());
        result.setPhone(user.getPhone());
        result.setStatus(user.getStatus());
        result.setCreateTime(user.getCreateTime());
        result.setUpdateTime(user.getUpdateTime());
        return result;
    }
}
