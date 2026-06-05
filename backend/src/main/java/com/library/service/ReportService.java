package com.library.service;

import com.library.dto.BookStats;
import com.library.dto.DashboardDto;
import com.library.dto.LoanDto;
import com.library.repository.BookRepository;
import com.library.repository.LoanRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private LoanService loanService;

    public List<BookStats> topBooks() {
        return loanRepository.findTopBooks();
    }

    public DashboardDto dashboard() {
        var books = bookRepository.findAll();
        long totalBooks = books.stream().mapToLong(book -> book.getTotalCopies() == null ? 0 : book.getTotalCopies())
                .sum();
        long availableBooks = books.stream()
                .mapToLong(book -> book.getAvailableCopies() == null ? 0 : book.getAvailableCopies()).sum();
        long issuedBooks = totalBooks - availableBooks;

        List<LoanDto> loans = loanService.findAll();
        long overdueLoans = loans.stream().filter(loan -> "overdue".equals(loan.getStatus())).count();

        List<LoanDto> returnedLoans = loans.stream().filter(loan -> "returned".equals(loan.getStatus())).toList();
        long averageLoanDays = 0;
        if (!returnedLoans.isEmpty()) {
            averageLoanDays = Math.round(returnedLoans.stream().mapToLong(loan -> {
                LocalDate start = LocalDate.parse(loan.getIssueDate());
                LocalDate end = loan.getReturnedAt() != null ? LocalDate.parse(loan.getReturnedAt())
                        : LocalDate.parse(loan.getDueDate());
                return ChronoUnit.DAYS.between(start, end);
            }).average().orElse(0));
        }

        List<DashboardDto.NamedCount> popularBooks = topBooks().stream()
                .limit(5)
                .map(stat -> new DashboardDto.NamedCount(stat.getTitle(), stat.getCount()))
                .toList();

        List<DashboardDto.NamedCount> readerActivity = loanRepository.findReaderActivity().stream()
                .limit(5)
                .map(row -> new DashboardDto.NamedCount((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        return new DashboardDto(totalBooks, availableBooks, issuedBooks, overdueLoans, averageLoanDays, popularBooks,
                readerActivity);
    }

    public byte[] exportExcel() throws Exception {
        List<BookStats> stats = topBooks();
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = wb.createSheet("Popular Books");
            int row = 0;
            var r0 = sheet.createRow(row++);
            r0.createCell(0).setCellValue("Title");
            r0.createCell(1).setCellValue("Loans");
            for (BookStats s : stats) {
                var r = sheet.createRow(row++);
                r.createCell(0).setCellValue(s.getTitle());
                r.createCell(1).setCellValue(s.getCount());
            }
            wb.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportPdf() throws Exception {
        List<BookStats> stats = topBooks();
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            PDPageContentStream cs = new PDPageContentStream(doc, page);
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
            cs.newLineAtOffset(50, 750);
            cs.showText("Popular Books Report");
            cs.newLineAtOffset(0, -20);
            cs.setFont(PDType1Font.HELVETICA, 12);
            for (BookStats s : stats) {
                cs.showText(s.getTitle() + " - " + s.getCount());
                cs.newLineAtOffset(0, -15);
            }
            cs.endText();
            cs.close();
            doc.save(out);
            return out.toByteArray();
        }
    }
}
