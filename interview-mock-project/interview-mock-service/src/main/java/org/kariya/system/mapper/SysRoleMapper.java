package org.kariya.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.kariya.system.entity.RoleUserCountRow;
import org.kariya.system.entity.SysRole;

import java.util.List;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

    @Select("""
                select r.role_key
                from sys_role r
                join sys_user_role ur on ur.role_id = r.id
                where ur.user_id = #{userId}
                  and r.status = 1
            """)
    List<String> selectRoleKeysByUserId(Long userId);

    @Select("""
            select r.*
            from sys_role r
            join sys_user_role ur on ur.role_id = r.id
            where ur.user_id = #{userId}
            order by r.id
            """)
    List<SysRole> selectRolesByUserId(Long userId);

    @Select("""
            <script>
            select role_id, count(*) as user_count
            from sys_user_role
            where role_id in
            <foreach collection='roleIds' item='roleId' open='(' separator=',' close=')'>
              #{roleId}
            </foreach>
            group by role_id
            </script>
            """)
    List<RoleUserCountRow> selectUserCounts(@Param("roleIds") List<Long> roleIds);

    @Select("select count(*) from sys_user_role where role_id = #{roleId}")
    long countUsersByRoleId(Long roleId);

    @Select("select menu_id from sys_role_menu where role_id = #{roleId} order by menu_id")
    List<Long> selectMenuIdsByRoleId(Long roleId);

    @Delete("delete from sys_role_menu where role_id = #{roleId}")
    int deleteRoleMenus(Long roleId);

    @Delete("delete from sys_user_role where role_id = #{roleId}")
    int deleteRoleUsers(Long roleId);

    @Insert("""
            <script>
            insert into sys_role_menu(role_id, menu_id, create_time) values
            <foreach collection='menuIds' item='menuId' separator=','>
              (#{roleId}, #{menuId}, now())
            </foreach>
            </script>
            """)
    int insertRoleMenus(@Param("roleId") Long roleId, @Param("menuIds") List<Long> menuIds);
}
