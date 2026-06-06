package com.library.service;

import com.library.model.Reader;
import com.library.repository.ReaderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReaderService {

    @Autowired
    private ReaderRepository readerRepository;

    public List<Reader> findAll() {
        return readerRepository.findAll();
    }

    public Optional<Reader> findById(Long id) {
        return readerRepository.findById(id);
    }

    public Reader save(Reader reader) {
        return readerRepository.save(reader);
    }

    public void delete(Long id) {
        readerRepository.deleteById(id);
    }
}
