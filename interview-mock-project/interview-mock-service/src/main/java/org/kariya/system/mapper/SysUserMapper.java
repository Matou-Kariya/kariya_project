package org.kariya.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.kariya.system.entity.SysUser;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}
