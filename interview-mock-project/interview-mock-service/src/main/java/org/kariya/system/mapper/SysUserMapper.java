package org.kariya.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.kariya.system.entity.SysUser;
import org.kariya.system.entity.UserRoleRow;

import java.util.List;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    @Select("""
            <script>
            select distinct u.*
            from sys_user u
            join sys_user_role ur on ur.user_id = u.id
            where ur.role_id = #{roleId}
            <if test='username != null and username != ""'>
              and u.username like concat('%', #{username}, '%')
            </if>
            <if test='nickname != null and nickname != ""'>
              and u.nickname like concat('%', #{nickname}, '%')
            </if>
            order by u.id desc
            </script>
            """)
    IPage<SysUser> selectUsersByRole(Page<SysUser> page, @Param("roleId") Long roleId,
                                     @Param("username") String username, @Param("nickname") String nickname);

    @Select("""
            <script>
            select u.*
            from sys_user u
            where not exists (
              select 1 from sys_user_role ur where ur.user_id = u.id and ur.role_id = #{roleId}
            )
            <if test='username != null and username != ""'>
              and u.username like concat('%', #{username}, '%')
            </if>
            <if test='nickname != null and nickname != ""'>
              and u.nickname like concat('%', #{nickname}, '%')
            </if>
            order by u.id desc
            </script>
            """)
    IPage<SysUser> selectAvailableUsers(Page<SysUser> page, @Param("roleId") Long roleId,
                                        @Param("username") String username, @Param("nickname") String nickname);

    @Select("""
            <script>
            select ur.user_id, r.id as role_id, r.role_name, r.role_key
            from sys_user_role ur
            join sys_role r on r.id = ur.role_id
            where ur.user_id in
            <foreach collection='userIds' item='userId' open='(' separator=',' close=')'>
              #{userId}
            </foreach>
            order by r.id
            </script>
            """)
    List<UserRoleRow> selectRoleRowsByUserIds(@Param("userIds") List<Long> userIds);

    @Delete("delete from sys_user_role where user_id = #{userId}")
    int deleteUserRoles(Long userId);

    @Delete("delete from sys_user_role where user_id = #{userId} and role_id = #{roleId}")
    int deleteUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);

    @Insert("""
            <script>
            insert into sys_user_role(user_id, role_id, create_time) values
            <foreach collection='roleIds' item='roleId' separator=','>
              (#{userId}, #{roleId}, now())
            </foreach>
            </script>
            """)
    int insertUserRoles(@Param("userId") Long userId, @Param("roleIds") List<Long> roleIds);

    @Insert("""
            <script>
            insert ignore into sys_user_role(user_id, role_id, create_time) values
            <foreach collection='userIds' item='userId' separator=','>
              (#{userId}, #{roleId}, now())
            </foreach>
            </script>
            """)
    int addUsersToRole(@Param("roleId") Long roleId, @Param("userIds") List<Long> userIds);
}
