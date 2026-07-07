package org.kariya.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.kariya.system.entity.SysMenu;

import java.util.List;

@Mapper
public interface SysMenuMapper extends BaseMapper<SysMenu> {
    @Select("""
                select distinct m.*
                from sys_menu m
                join sys_role_menu rm on rm.menu_id = m.id
                join sys_user_role ur on ur.role_id = rm.role_id
                where ur.user_id = #{userId}
                  and m.status = 1
                order by m.parent_id, m.order_num
            """)
    List<SysMenu> selectMenusByUserId(Long userId);

    @Select("""
                select *
                from sys_menu
                where status = 1
                order by parent_id, order_num
            """)
    List<SysMenu> selectAllEnabledMenus();
}
