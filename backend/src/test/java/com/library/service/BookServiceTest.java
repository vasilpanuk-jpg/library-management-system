package com.library.service;

import com.library.model.Book;
import com.library.repository.BookRepository;
import com.library.repository.LoanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = { BookServiceTest.Config.class })
public class BookServiceTest {

    @TestConfiguration
    @EnableCaching
    static class Config {
        @Bean
        public CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("books::all", "books::byId", "books::search");
        }

        @Bean
        public BookRepository bookRepository() {
            return Mockito.mock(BookRepository.class);
        }

        @Bean
        public LoanRepository loanRepository() {
            LoanRepository repo = Mockito.mock(LoanRepository.class);
            Mockito.when(repo.countByBookId(Mockito.anyLong())).thenReturn(0L);
            Mockito.when(repo.findLastIssuedDateByBookId(Mockito.anyLong())).thenReturn(Optional.empty());
            return repo;
        }

        @Bean
        public BookService bookService(BookRepository repo, LoanRepository loanRepository) {
            return new BookService(repo, loanRepository);
        }
    }

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookService bookService;

    private Book sample;

    @BeforeEach
    void setup() {
        sample = new Book();
        sample.setId(1L);
        sample.setTitle("Title");
        sample.setAuthor("Author");
        sample.setIsbn("ISBN-1");
        sample.setYear(2020);
        sample.setPublisher("Pub");
        sample.setCategory("Cat");
        sample.setTotalCopies(3);
        sample.setAvailableCopies(3);
        Mockito.when(bookRepository.findAll()).thenReturn(List.of(sample));
        Mockito.when(bookRepository.findById(1L)).thenReturn(Optional.of(sample));
        Mockito.when(bookRepository.findByTitleContainingIgnoreCase("Title")).thenReturn(List.of(sample));
    }

    @Test
    void testFindAllUsesCache() {
        var a = bookService.findAll();
        var b = bookService.findAll();
        assertThat(a).hasSize(1);
        Mockito.verify(bookRepository, times(1)).findAll();
    }

    @Test
    void testFindByIdUsesCache() {
        var a = bookService.findById(1L);
        var b = bookService.findById(1L);
        assertThat(a).isPresent();
        Mockito.verify(bookRepository, times(1)).findById(1L);
    }

    @Test
    void testSearchUsesCache() {
        var a = bookService.searchByTitle("Title");
        var b = bookService.searchByTitle("Title");
        assertThat(a).hasSize(1);
        Mockito.verify(bookRepository, times(1)).findByTitleContainingIgnoreCase("Title");
    }
}
