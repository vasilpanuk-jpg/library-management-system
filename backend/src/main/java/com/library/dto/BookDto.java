package com.library.dto;

import com.library.model.Book;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookDto {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String category;
    private List<String> keywords;
    private Integer year;
    private String publisher;
    private String location;
    private Integer totalCopies;
    private Integer availableCopies;
    private String status;
    private Long issuedCount;
    private String lastIssuedAt;

    public static BookDto from(Book book, long issuedCount, String lastIssuedAt) {
        String status = book.getAvailableCopies() != null && book.getAvailableCopies() > 0 ? "available" : "issued";
        if (book.getStatus() != null && !book.getStatus().isBlank()) {
            status = book.getStatus();
        }
        return new BookDto(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getCategory(),
                parseKeywords(book.getKeywords()),
                book.getYear(),
                book.getPublisher(),
                book.getLocation(),
                book.getTotalCopies(),
                book.getAvailableCopies(),
                status,
                issuedCount,
                lastIssuedAt);
    }

    public Book toEntity() {
        Book book = new Book();
        book.setId(id);
        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn);
        book.setCategory(category);
        book.setKeywords(joinKeywords(keywords));
        book.setYear(year);
        book.setPublisher(publisher);
        book.setLocation(location);
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(availableCopies);
        book.setStatus(status);
        return book;
    }

    public static List<String> parseKeywords(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public static String joinKeywords(List<String> keywords) {
        if (keywords == null || keywords.isEmpty()) {
            return null;
        }
        return String.join(",", keywords);
    }
}
