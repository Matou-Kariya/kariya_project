package org.kariya.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private Long userId;
    private String username;
    private List<String> roles;
    private List<String> permissions;
}
