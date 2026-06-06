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
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = { BookServiceTest.Config.class })
public class BookServiceTest {

    @TestConfiguration
    static class Config {
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
    void testFindAll() {
        assertThat(bookService.findAll()).hasSize(1);
    }

    @Test
    void testFindById() {
        assertThat(bookService.findById(1L)).isPresent();
    }

    @Test
    void testSearchByTitle() {
        assertThat(bookService.searchByTitle("Title")).hasSize(1);
    }
}
