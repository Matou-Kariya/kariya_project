package org.kariya.system.entity;

import java.util.List;

public record UserSaveRequest(
        String username,
        String password,
        String nickname,
        String avatar,
        String email,
        String phone,
        Integer status,
        List<Long> roleIds
) {
}
