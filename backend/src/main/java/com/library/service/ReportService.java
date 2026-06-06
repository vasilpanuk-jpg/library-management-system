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

        LocalDate weekAgo = LocalDate.now().minusWeeks(1);
        long weekNewLoans = loans.stream().filter(loan -> LocalDate.parse(loan.getIssueDate()).isAfter(weekAgo)).count();
        long weekReturns = returnedLoans.stream().filter(loan -> loan.getReturnedAt() != null && LocalDate.parse(loan.getReturnedAt()).isAfter(weekAgo)).count();

        List<DashboardDto.NamedCount> popularBooks = topBooks().stream()
                .limit(5)
                .map(stat -> new DashboardDto.NamedCount(stat.getTitle(), stat.getCount()))
                .toList();

        List<DashboardDto.NamedCount> readerActivity = loanRepository.findReaderActivity().stream()
                .limit(5)
                .map(row -> new DashboardDto.NamedCount((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        List<DashboardDto.NamedCount> weekTopBooks = loans.stream()
                .filter(loan -> LocalDate.parse(loan.getIssueDate()).isAfter(weekAgo))
                .collect(java.util.stream.Collectors.groupingBy(loan -> loan.getBookId(), java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(3)
                .map(entry -> {
                    String title = bookRepository.findById(entry.getKey())
                            .map(book -> book.getTitle())
                            .orElse("ID " + entry.getKey());
                    return new DashboardDto.NamedCount(title, entry.getValue());
                })
                .toList();

        return new DashboardDto(totalBooks, availableBooks, issuedBooks, overdueLoans, averageLoanDays, weekNewLoans, weekReturns, popularBooks,
                readerActivity, weekTopBooks);
    }

    public byte[] exportExcel() throws Exception {
        DashboardDto dashboard = dashboard();
        List<BookStats> stats = topBooks();
        
        try (org.apache.poi.xssf.usermodel.XSSFWorkbook wb = new org.apache.poi.xssf.usermodel.XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            org.apache.poi.xssf.usermodel.XSSFSheet summarySheet = wb.createSheet("Зведення");
            int row = 0;
            
            var titleRow = summarySheet.createRow(row++);
            titleRow.createCell(0).setCellValue("ЗВІТ ПРО СТАН БІБЛІОТЕЧНОГО ФОНДУ");
            titleRow.createCell(1).setCellValue(java.time.LocalDate.now().toString());
            
            row++;
            
            var fundHeader = summarySheet.createRow(row++);
            fundHeader.createCell(0).setCellValue("СТАН ФОНДУ");
            
            var totalRow = summarySheet.createRow(row++);
            totalRow.createCell(0).setCellValue("Всього примірників:");
            totalRow.createCell(1).setCellValue(dashboard.getTotalBooks());
            
            var availableRow = summarySheet.createRow(row++);
            availableRow.createCell(0).setCellValue("В наявності:");
            availableRow.createCell(1).setCellValue(dashboard.getAvailableBooks());
            
            var issuedRow = summarySheet.createRow(row++);
            issuedRow.createCell(0).setCellValue("Видані:");
            issuedRow.createCell(1).setCellValue(dashboard.getIssuedBooks());
            
            var overdueRow = summarySheet.createRow(row++);
            overdueRow.createCell(0).setCellValue("Прострочені:");
            overdueRow.createCell(1).setCellValue(dashboard.getOverdueLoans());
            
            row++;
            
            var activityHeader = summarySheet.createRow(row++);
            activityHeader.createCell(0).setCellValue("АКТИВНІСТЬ ЧИТАЧІВ");
            
            var activityTitleRow = summarySheet.createRow(row++);
            activityTitleRow.createCell(0).setCellValue("Читач");
            activityTitleRow.createCell(1).setCellValue("Кількість видач");
            
            for (DashboardDto.NamedCount reader : dashboard.getReaderActivity()) {
                var r = summarySheet.createRow(row++);
                r.createCell(0).setCellValue(reader.getName());
                r.createCell(1).setCellValue(reader.getCount());
            }
            
            row++;
            
            var popularHeader = summarySheet.createRow(row++);
            popularHeader.createCell(0).setCellValue("ПОПУЛЯРНІ КНИГИ");
            
            var popularTitleRow = summarySheet.createRow(row++);
            popularTitleRow.createCell(0).setCellValue("Назва книги");
            popularTitleRow.createCell(1).setCellValue("Кількість видач");
            
            for (BookStats s : stats) {
                var r = summarySheet.createRow(row++);
                r.createCell(0).setCellValue(s.getTitle());
                r.createCell(1).setCellValue(s.getCount());
            }
            
            summarySheet.autoSizeColumn(0);
            summarySheet.autoSizeColumn(1);
            
            wb.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportPdf() throws Exception {
        DashboardDto dashboard = dashboard();
        List<BookStats> stats = topBooks();

        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 16);
                cs.newLineAtOffset(50, 750);
                cs.showText("ЗВІТ ПРО СТАН БІБЛІОТЕЧНОГО ФОНДУ");
                cs.newLineAtOffset(0, -30);
                cs.setFont(PDType1Font.HELVETICA, 10);
                cs.showText(java.time.LocalDate.now().toString());
                cs.newLineAtOffset(0, -24);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                cs.showText("СТАН ФОНДУ");
                cs.newLineAtOffset(0, -18);
                cs.setFont(PDType1Font.HELVETICA, 11);
                cs.showText("Всього примірників: " + dashboard.getTotalBooks());
                cs.newLineAtOffset(0, -16);
                cs.showText("В наявності: " + dashboard.getAvailableBooks());
                cs.newLineAtOffset(0, -16);
                cs.showText("Видані: " + dashboard.getIssuedBooks());
                cs.newLineAtOffset(0, -16);
                cs.showText("Прострочені: " + dashboard.getOverdueLoans());
                cs.newLineAtOffset(0, -24);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                cs.showText("АКТИВНІСТЬ ЧИТАЧІВ");
                cs.newLineAtOffset(0, -18);
                cs.setFont(PDType1Font.HELVETICA, 10);
                for (DashboardDto.NamedCount reader : dashboard.getReaderActivity()) {
                    cs.showText(reader.getName() + ": " + reader.getCount() + " видач");
                    cs.newLineAtOffset(0, -16);
                }
                cs.newLineAtOffset(0, -10);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                cs.showText("ПОПУЛЯРНІ КНИГИ");
                cs.newLineAtOffset(0, -18);
                cs.setFont(PDType1Font.HELVETICA, 10);
                for (BookStats s : stats) {
                    cs.showText(s.getTitle() + " - " + s.getCount() + " видач");
                    cs.newLineAtOffset(0, -16);
                }
                cs.newLineAtOffset(0, -10);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                cs.showText("ТОП 3 КНИГИ ТИЖНЯ");
                cs.newLineAtOffset(0, -18);
                cs.setFont(PDType1Font.HELVETICA, 10);
                for (DashboardDto.NamedCount book : dashboard.getWeekTopBooks()) {
                    cs.showText(book.getName() + " - " + book.getCount() + " видач");
                    cs.newLineAtOffset(0, -16);
                }
                cs.endText();
            }
            doc.save(out);
            return out.toByteArray();
        }
    }
}
