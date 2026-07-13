package org.kariya.entity;

import com.baomidou.mybatisplus.core.metadata.IPage;

import java.util.List;

public record PageResult<T>(List<T> records, long total, long current, long size) {

    public static <T> PageResult<T> from(IPage<?> page, List<T> records) {
        return new PageResult<>(records, page.getTotal(), page.getCurrent(), page.getSize());
    }
}
