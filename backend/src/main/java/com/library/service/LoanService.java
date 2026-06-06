package com.library.service;

import com.library.dto.LoanDto;
import com.library.exception.ApiException;
import com.library.model.Book;
import com.library.model.Loan;
import com.library.model.Reader;
import com.library.repository.BookRepository;
import com.library.repository.LoanRepository;
import com.library.repository.ReaderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ReaderRepository readerRepository;

    public List<LoanDto> findAll() {
        return loanRepository.findAll().stream().map(LoanDto::from).toList();
    }

    @Transactional
    public LoanDto issue(Long userId, Long bookId, Integer periodDays) {
        Reader reader = readerRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Читача не знайдено"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Книгу не знайдено"));
        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("Немає доступних екземплярів");
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() <= 0) {
            book.setStatus("issued");
        }
        bookRepository.save(book);

        int days = periodDays == null || periodDays < 1 ? 14 : periodDays;
        Loan loan = new Loan();
        loan.setReader(reader);
        loan.setBook(book);
        loan.setIssuedDate(LocalDate.now());
        loan.setDueDate(LocalDate.now().plusDays(days));
        loan.setStatus("ISSUED");
        return LoanDto.from(loanRepository.save(loan));
    }

    @Transactional
    public LoanDto returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Видачу не знайдено"));
        if (loan.getReturnedDate() != null) {
            return LoanDto.from(loan);
        }
        loan.setReturnedDate(LocalDate.now());
        loan.setStatus("RETURNED");
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setStatus("available");
        bookRepository.save(book);
        return LoanDto.from(loanRepository.save(loan));
    }

    public List<LoanDto> overdue() {
        return loanRepository.findByDueDateBeforeAndReturnedDateIsNull(LocalDate.now()).stream()
                .map(LoanDto::from)
                .toList();
    }
}
