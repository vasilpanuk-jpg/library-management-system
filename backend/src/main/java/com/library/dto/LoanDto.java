package com.library.dto;

import com.library.model.Loan;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanDto {
    private Long id;
    private Long bookId;
    private Long readerId;
    private String readerName;
    private String issueDate;
    private String dueDate;
    private String returnedAt;
    private String status;

    public static LoanDto from(Loan loan) {
        Long userId = loan.getReader() != null && loan.getReader().getUser() != null
                ? loan.getReader().getUser().getId()
                : loan.getReader() != null ? loan.getReader().getId() : null;
        String readerName = loan.getReader() != null ? loan.getReader().getFullName() : null;
        Long bookId = loan.getBook() != null ? loan.getBook().getId() : null;
        return new LoanDto(
                loan.getId(),
                bookId,
                userId,
                readerName,
                formatDate(loan.getIssuedDate()),
                formatDate(loan.getDueDate()),
                formatDate(loan.getReturnedDate()),
                mapStatus(loan));
    }

    private static String mapStatus(Loan loan) {
        if (loan.getReturnedDate() != null || "RETURNED".equalsIgnoreCase(loan.getStatus())) {
            return "returned";
        }
        if (loan.getDueDate() != null && loan.getDueDate().isBefore(LocalDate.now())) {
            return "overdue";
        }
        return "active";
    }

    private static String formatDate(LocalDate date) {
        return date != null ? date.toString() : null;
    }
}
