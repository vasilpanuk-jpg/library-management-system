package com.library.controller;

import com.library.dto.BookDto;
import com.library.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@Tag(name = "Books", description = "Каталог технічної літератури")
@SecurityRequirement(name = "sessionCookie")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    @Operation(summary = "Отримати всі книги або відфільтрований список")
    public List<BookDto> all(@RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        if ((query != null && !query.isBlank()) || (category != null && !category.isBlank())
                || (status != null && !status.isBlank())) {
            return bookService.search(query, category, status);
        }
        return bookService.findAll();
    }

    @GetMapping("/search")
    @Operation(summary = "Пошук книг за назвою")
    public List<BookDto> search(@RequestParam String title) {
        return bookService.searchByTitle(title);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Отримати книгу за ID")
    public ResponseEntity<BookDto> get(@PathVariable Long id) {
        return bookService.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LIBRARIAN')")
    @Operation(summary = "Додати нову книгу")
    public BookDto create(@RequestBody BookDto book) {
        if (book.getTitle() == null || book.getTitle().isBlank()) {
            throw new IllegalStateException("Назва книги обов'язкова");
        }
        if (book.getAuthor() == null || book.getAuthor().isBlank()) {
            throw new IllegalStateException("Автор книги обов'язковий");
        }
        if (book.getTotalCopies() == null || book.getTotalCopies() < 1) {
            throw new IllegalStateException("Кількість екземплярів має бути від 1");
        }
        return bookService.save(book);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LIBRARIAN')")
    @Operation(summary = "Оновити книгу")
    public ResponseEntity<BookDto> update(@PathVariable Long id, @RequestBody BookDto updated) {
        return bookService.findById(id).map(existing -> {
            updated.setId(id);
            if (updated.getAvailableCopies() == null) {
                updated.setAvailableCopies(updated.getTotalCopies());
            }
            return ResponseEntity.ok(bookService.save(updated));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LIBRARIAN')")
    @Operation(summary = "Видалити книгу")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
