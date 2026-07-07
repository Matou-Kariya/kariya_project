package org.kariya.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_menu")
public class SysMenu {

    @TableId(type = IdType.AUTO)
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

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}