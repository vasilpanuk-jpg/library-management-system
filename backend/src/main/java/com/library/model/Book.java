package com.library.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String author;

    private String isbn;

    private Integer year;

    private String publisher;

    private String category;

    private Integer totalCopies = 0;

    private Integer availableCopies = 0;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    private String location;

    private String status = "available";
}
