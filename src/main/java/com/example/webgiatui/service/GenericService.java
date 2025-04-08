package com.example.webgiatui.service;

import java.util.List;

public interface GenericService<T> {
    List<T> getAll();
    T create(T entity);
    T getById(Long id);
    T update(Long id, T entity);
    void delete(Long id);
}
