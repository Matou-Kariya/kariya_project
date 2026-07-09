package org.kariya.system.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuVO {
    private Long id;
    private Long parentId;
    private String menuName;
    private String path;
    private String component;
    private String icon;
    private Integer menuType;
    private String permission;
    private Integer orderNum;
    private Integer status;
    private List<MenuVO> children = new ArrayList<>();

    public static MenuVO from(SysMenu menu) {
        MenuVO vo = new MenuVO();
        vo.setId(menu.getId());
        vo.setParentId(menu.getParentId());
        vo.setMenuName(menu.getMenuName());
        vo.setPath(menu.getPath());
        vo.setComponent(menu.getComponent());
        vo.setIcon(menu.getIcon());
        vo.setMenuType(menu.getMenuType());
        vo.setPermission(menu.getPermission());
        vo.setOrderNum(menu.getOrderNum());
        vo.setStatus(menu.getStatus());
        vo.setChildren(new ArrayList<>());
        return vo;
    }
}
