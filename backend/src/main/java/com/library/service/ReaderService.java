package com.library.service;

import com.library.model.Reader;
import com.library.repository.ReaderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReaderService {

    @Autowired
    private ReaderRepository readerRepository;

    @Cacheable(value = "readers::all")
    public List<Reader> findAll() {
        return readerRepository.findAll();
    }

    @Cacheable(value = "readers::byId", key = "#id")
    public Optional<Reader> findById(Long id) {
        return readerRepository.findById(id);
    }

    @CacheEvict(value = "readers::all", allEntries = true)
    public Reader save(Reader reader) {
        return readerRepository.save(reader);
    }

    @CacheEvict(value = "readers::all", allEntries = true)
    public void delete(Long id) {
        readerRepository.deleteById(id);
    }
}
