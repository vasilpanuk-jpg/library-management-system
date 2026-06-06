-- Demo users (passwords: admin, librarian, reader, reader123)
INSERT INTO users (username, password, email, role, full_name, phone, email_verified)
SELECT 'admin', '$2a$10$hIqe05QmGgZfkJlDT2cwA.5EmILkxODUs.DAaQWCsnB6Oj88gsUPu',
       'admin@library.local', 'ROLE_ADMIN', 'System Administrator', '+380000000001', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password, email, role, full_name, phone, email_verified)
SELECT 'librarian', '$2a$10$OZYoeakvJz.WBzMC0MAln.Z3IbFFq8QiCtq4bra7GMc34Z.wnbqDC',
       'librarian@library.local', 'ROLE_LIBRARIAN', 'Chief Librarian', '+380000000002', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'librarian');

INSERT INTO users (username, password, email, role, full_name, phone, email_verified)
SELECT 'reader', '$2a$10$ryiznL2YH6PeDahtHa4p6eDzV/c/y3MyX/VsPnq0Rb7IjefhM3qhC',
       'reader@library.local', 'ROLE_READER', 'Reader Demo', '+380000000003', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'reader');

INSERT INTO users (username, password, email, role, full_name, phone, email_verified)
SELECT 'olena.k', '$2a$10$GWMSn9zfpfyoHa5Z3lsYgOsgGgigmoYNwMn.YlqFjzwqCls4lRQXy',
       'olena.k@library.local', 'ROLE_READER', 'Олена Коваленко', '+380501112233', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'olena.k');

INSERT INTO users (username, password, email, role, full_name, phone, email_verified)
SELECT 'ivan.p', '$2a$10$GWMSn9zfpfyoHa5Z3lsYgOsgGgigmoYNwMn.YlqFjzwqCls4lRQXy',
       'ivan.p@library.local', 'ROLE_READER', 'Іван Петренко', '+380502223344', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'ivan.p');

INSERT INTO users (username, password, email, role, full_name, phone, email_verified)
SELECT 'maria.s', '$2a$10$GWMSn9zfpfyoHa5Z3lsYgOsgGgigmoYNwMn.YlqFjzwqCls4lRQXy',
       'maria.s@library.local', 'ROLE_READER', 'Марія Сидоренко', '+380503334455', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'maria.s');

-- Reader profiles for demo users
INSERT INTO readers (full_name, email, phone, user_id)
SELECT u.full_name, u.email, u.phone, u.id
FROM users u
WHERE u.username IN ('admin', 'librarian', 'reader', 'olena.k', 'ivan.p', 'maria.s')
  AND NOT EXISTS (SELECT 1 FROM readers r WHERE r.user_id = u.id);

-- Demo books
INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'Clean Architecture', 'Robert C. Martin', '978-0134494166', 'Software Engineering',
       'architecture,design,clean code', 2017, 'Prentice Hall', 'A-1-01', 6, 4, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0134494166');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Databases',
       'distributed systems,data,database', 2017, 'O''Reilly Media', 'B-2-05', 5, 1, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-1449373320');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'The Pragmatic Programmer', 'Andrew Hunt', '978-0135957059', 'Programming',
       'best practices,software craft', 2019, 'Addison-Wesley', 'A-3-02', 8, 8, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0135957059');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'Refactoring', 'Martin Fowler', '978-0134757599', 'Programming',
       'refactor,code quality,maintainability', 2018, 'Addison-Wesley', 'C-1-07', 4, 0, 'issued'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0134757599');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'High Performance Browser Networking', 'Ilya Grigorik', '978-1449344764', 'Networking',
       'network,performance,browser', 2013, 'O''Reilly Media', 'D-4-03', 3, 2, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-1449344764');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'Database System Concepts', 'Abraham Silberschatz', '978-0073523323', 'Databases',
       'sql,database,concepts', 2020, 'McGraw-Hill', 'B-1-11', 7, 5, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0073523323');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262046305', 'Algorithms',
       'algorithms,complexity,structures', 2022, 'MIT Press', 'A-2-04', 5, 3, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0262046305');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'Computer Networking: A Top-Down Approach', 'James Kurose', '978-0136681557', 'Networking',
       'tcp,ip,network', 2021, 'Pearson', 'D-1-02', 4, 4, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0136681557');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'Operating System Concepts', 'Abraham Silberschatz', '978-1119800361', 'Operating Systems',
       'os,kernel,processes', 2021, 'Wiley', 'C-2-08', 6, 2, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-1119800361');

INSERT INTO books (title, author, isbn, category, keywords, year, publisher, location, total_copies, available_copies, status)
SELECT 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0134610993', 'AI',
       'ai,machine learning,agents', 2020, 'Pearson', 'E-1-01', 3, 1, 'available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '978-0134610993');

-- Demo loans
INSERT INTO loans (reader_id, book_id, issued_date, due_date, returned_date, status)
SELECT r.id, b.id, DATE '2026-06-01', DATE '2026-06-15', NULL, 'ISSUED'
FROM readers r
JOIN users u ON u.id = r.user_id
JOIN books b ON b.isbn = '978-1449373320'
WHERE u.username = 'reader'
  AND NOT EXISTS (
    SELECT 1 FROM loans l
    WHERE l.reader_id = r.id AND l.book_id = b.id AND l.issued_date = DATE '2026-06-01'
  );

INSERT INTO loans (reader_id, book_id, issued_date, due_date, returned_date, status)
SELECT r.id, b.id, DATE '2026-05-18', DATE '2026-06-01', DATE '2026-06-02', 'RETURNED'
FROM readers r
JOIN users u ON u.id = r.user_id
JOIN books b ON b.isbn = '978-0134757599'
WHERE u.username = 'reader'
  AND NOT EXISTS (
    SELECT 1 FROM loans l
    WHERE l.reader_id = r.id AND l.book_id = b.id AND l.issued_date = DATE '2026-05-18'
  );

INSERT INTO loans (reader_id, book_id, issued_date, due_date, returned_date, status)
SELECT r.id, b.id, DATE '2026-05-20', DATE '2026-06-03', NULL, 'ISSUED'
FROM readers r
JOIN users u ON u.id = r.user_id
JOIN books b ON b.isbn = '978-0134494166'
WHERE u.username = 'librarian'
  AND NOT EXISTS (
    SELECT 1 FROM loans l
    WHERE l.reader_id = r.id AND l.book_id = b.id AND l.issued_date = DATE '2026-05-20'
  );

INSERT INTO loans (reader_id, book_id, issued_date, due_date, returned_date, status)
SELECT r.id, b.id, DATE '2026-05-10', DATE '2026-05-24', NULL, 'ISSUED'
FROM readers r
JOIN users u ON u.id = r.user_id
JOIN books b ON b.isbn = '978-0134610993'
WHERE u.username = 'reader'
  AND NOT EXISTS (
    SELECT 1 FROM loans l
    WHERE l.reader_id = r.id AND l.book_id = b.id AND l.issued_date = DATE '2026-05-10'
  );
