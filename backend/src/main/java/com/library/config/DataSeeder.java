package com.library.config;

import com.library.model.Book;
import com.library.model.Loan;
import com.library.model.Reader;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.LoanRepository;
import com.library.repository.ReaderRepository;
import com.library.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
            ReaderRepository readerRepository,
            BookRepository bookRepository,
            LoanRepository loanRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            User admin = createUser(userRepository, passwordEncoder, "admin", "admin", "System Administrator",
                    "admin@library.local", "+380000000001", "ROLE_ADMIN");
            User librarian = createUser(userRepository, passwordEncoder, "librarian", "librarian", "Chief Librarian",
                    "librarian@library.local", "+380000000002", "ROLE_LIBRARIAN");
            User readerUser = createUser(userRepository, passwordEncoder, "reader", "reader", "Reader Demo",
                    "reader@library.local", "+380000000003", "ROLE_READER");

            createReader(readerRepository, admin);
            Reader librarianReader = createReader(readerRepository, librarian);
            Reader reader = createReader(readerRepository, readerUser);

            Book cleanArchitecture = createBook(bookRepository, "Clean Architecture", "Robert C. Martin",
                    "978-0134494166", "Software Engineering", "architecture,design,clean code", 2017, "Prentice Hall",
                    "A-1-01", 6, 4);
            Book dataIntensive = createBook(bookRepository, "Designing Data-Intensive Applications", "Martin Kleppmann",
                    "978-1449373320", "Databases", "distributed systems,data,database", 2017, "O'Reilly Media", "B-2-05",
                    5, 1);
            Book pragmatic = createBook(bookRepository, "The Pragmatic Programmer", "Andrew Hunt", "978-0135957059",
                    "Programming", "best practices,software craft", 2019, "Addison-Wesley", "A-3-02", 8, 8);
            Book refactoring = createBook(bookRepository, "Refactoring", "Martin Fowler", "978-0134757599",
                    "Programming", "refactor,code quality,maintainability", 2018, "Addison-Wesley", "C-1-07", 4, 0);
            createBook(bookRepository, "High Performance Browser Networking", "Ilya Grigorik", "978-1449344764",
                    "Networking", "network,performance,browser", 2013, "O'Reilly Media", "D-4-03", 3, 2);
            createBook(bookRepository, "Database System Concepts", "Abraham Silberschatz", "978-0073523323", "Databases",
                    "sql,database,concepts", 2020, "McGraw-Hill", "B-1-11", 7, 5);

            createLoan(loanRepository, reader, dataIntensive, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 15), null);
            createLoan(loanRepository, reader, refactoring, LocalDate.of(2026, 5, 18), LocalDate.of(2026, 6, 1),
                    LocalDate.of(2026, 6, 2));
            createLoan(loanRepository, librarianReader, cleanArchitecture, LocalDate.of(2026, 5, 20),
                    LocalDate.of(2026, 6, 3), null);
        };
    }

    private User createUser(UserRepository userRepository, PasswordEncoder passwordEncoder, String username,
            String password, String fullName, String email, String phone, String role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole(role);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private Reader createReader(ReaderRepository readerRepository, User user) {
        Reader reader = new Reader();
        reader.setFullName(user.getFullName());
        reader.setEmail(user.getEmail());
        reader.setPhone(user.getPhone());
        reader.setUser(user);
        return readerRepository.save(reader);
    }

    private Book createBook(BookRepository bookRepository, String title, String author, String isbn, String category,
            String keywords, int year, String publisher, String location, int totalCopies, int availableCopies) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn);
        book.setCategory(category);
        book.setKeywords(keywords);
        book.setYear(year);
        book.setPublisher(publisher);
        book.setLocation(location);
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(availableCopies);
        book.setStatus(availableCopies > 0 ? "available" : "issued");
        return bookRepository.save(book);
    }

    private void createLoan(LoanRepository loanRepository, Reader reader, Book book, LocalDate issuedDate,
            LocalDate dueDate, LocalDate returnedDate) {
        Loan loan = new Loan();
        loan.setReader(reader);
        loan.setBook(book);
        loan.setIssuedDate(issuedDate);
        loan.setDueDate(dueDate);
        loan.setReturnedDate(returnedDate);
        loan.setStatus(returnedDate != null ? "RETURNED" : "ISSUED");
        loanRepository.save(loan);
    }
}
