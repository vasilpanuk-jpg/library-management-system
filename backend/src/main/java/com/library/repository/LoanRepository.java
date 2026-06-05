package com.library.repository;

import com.library.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByDueDateBeforeAndReturnedDateIsNull(LocalDate date);

    long countByBookId(Long bookId);

    @org.springframework.data.jpa.repository.Query("SELECT MAX(l.issuedDate) FROM Loan l WHERE l.book.id = :bookId")
    Optional<LocalDate> findLastIssuedDateByBookId(Long bookId);

    @org.springframework.data.jpa.repository.Query("SELECT new com.library.dto.BookStats(b.id, b.title, COUNT(l)) FROM Loan l JOIN l.book b GROUP BY b.id, b.title ORDER BY COUNT(l) DESC")
    List<com.library.dto.BookStats> findTopBooks();

    @org.springframework.data.jpa.repository.Query("SELECT r.fullName, COUNT(l) FROM Loan l JOIN l.reader r GROUP BY r.id, r.fullName ORDER BY COUNT(l) DESC")
    List<Object[]> findReaderActivity();
}
