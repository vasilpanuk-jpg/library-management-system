package com.library.controller;

import com.library.dto.LoanDto;
import com.library.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@Tag(name = "Loans", description = "Видача та повернення книг")
@SecurityRequirement(name = "sessionCookie")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @GetMapping
    @Operation(summary = "Список усіх видач")
    public List<LoanDto> all() {
        return loanService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN') or hasRole('READER')")
    @Operation(summary = "Оформити видачу книги")
    public ResponseEntity<LoanDto> issue(@RequestParam Long readerId,
            @RequestParam Long bookId,
            @RequestParam(required = false) Integer periodDays) {
        return ResponseEntity.ok(loanService.issue(readerId, bookId, periodDays));
    }

    @PutMapping("/return/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Повернути книгу")
    public ResponseEntity<LoanDto> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.returnBook(id));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Прострочені видачі")
    public List<LoanDto> overdue() {
        return loanService.overdue();
    }
}
