package com.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private long totalBooks;
    private long availableBooks;
    private long issuedBooks;
    private long overdueLoans;
    private long averageLoanDays;
    private List<NamedCount> popularBooks;
    private List<NamedCount> readerActivity;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NamedCount {
        private String name;
        private long count;
    }
}
