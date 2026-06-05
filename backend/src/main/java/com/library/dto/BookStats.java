package com.library.dto;

public class BookStats {
    private Long bookId;
    private String title;
    private Long count;

    public BookStats(Long bookId, String title, Long count) {
        this.bookId = bookId;
        this.title = title;
        this.count = count;
    }

    public Long getBookId() {
        return bookId;
    }

    public String getTitle() {
        return title;
    }

    public Long getCount() {
        return count;
    }
}
