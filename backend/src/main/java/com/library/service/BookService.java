package com.library.service;

import com.library.dto.BookDto;
import com.library.model.Book;
import com.library.repository.BookRepository;
import com.library.repository.LoanRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;

    public BookService(BookRepository bookRepository, LoanRepository loanRepository) {
        this.bookRepository = bookRepository;
        this.loanRepository = loanRepository;
    }

    @Caching(evict = {
            @CacheEvict(value = "books::all", allEntries = true),
            @CacheEvict(value = "books::byId", key = "#book.id", condition = "#book.id != null")
    })
    public BookDto save(BookDto bookDto) {
        Book book = bookDto.toEntity();
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        if (book.getStatus() == null || book.getStatus().isBlank()) {
            book.setStatus(book.getAvailableCopies() > 0 ? "available" : "issued");
        }
        Book saved = bookRepository.save(book);
        return toDto(saved);
    }

    @Cacheable(value = "books::byId", key = "#id")
    public Optional<BookDto> findById(Long id) {
        return bookRepository.findById(id).map(this::toDto);
    }

    @Cacheable(value = "books::search", key = "#title")
    public List<BookDto> searchByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title).stream().map(this::toDto).toList();
    }

    @Cacheable(value = "books::all")
    public List<BookDto> findAll() {
        return bookRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<BookDto> search(String query, String category, String status) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return findAll().stream()
                .filter(book -> normalizedQuery.isEmpty() || matchesQuery(book, normalizedQuery))
                .filter(book -> category == null || category.isBlank() || "all".equals(category)
                        || category.equals(book.getCategory()))
                .filter(book -> status == null || status.isBlank() || "all".equals(status)
                        || status.equals(book.getStatus()))
                .toList();
    }

    @Caching(evict = {
            @CacheEvict(value = "books::all", allEntries = true),
            @CacheEvict(value = "books::byId", key = "#id"),
            @CacheEvict(value = "books::search", allEntries = true)
    })
    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    private boolean matchesQuery(BookDto book, String query) {
        String haystack = String.join(" ",
                safe(book.getTitle()),
                safe(book.getAuthor()),
                safe(book.getIsbn()),
                safe(book.getCategory()),
                book.getKeywords() != null ? String.join(" ", book.getKeywords()) : "").toLowerCase(Locale.ROOT);
        return haystack.contains(query);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private BookDto toDto(Book book) {
        long issuedCount = loanRepository.countByBookId(book.getId());
        String lastIssuedAt = loanRepository.findLastIssuedDateByBookId(book.getId())
                .map(date -> date.toString())
                .orElse(null);
        return BookDto.from(book, issuedCount, lastIssuedAt);
    }
}
