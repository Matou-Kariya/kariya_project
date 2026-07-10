package org.kariya.system.entity;

public record MenuSaveRequest(
        Long parentId,
        String menuName,
        String path,
        String component,
        String icon,
        Integer menuType,
        String permission,
        Integer orderNum,
        Integer status
) {
}
