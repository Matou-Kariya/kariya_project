package org.kariya.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
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
}
