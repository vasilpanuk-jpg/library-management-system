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
        DashboardDto dashboard = dashboard();
        List<BookStats> stats = topBooks();
        
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Sheet 1: Dashboard Summary
            XSSFSheet summarySheet = wb.createSheet("Зведення");
            int row = 0;
            
            // Title
            var titleRow = summarySheet.createRow(row++);
            titleRow.createCell(0).setCellValue("ЗВІТ ПРО СТАН БІБЛІОТЕЧНОГО ФОНДУ");
            titleRow.createCell(1).setCellValue(java.time.LocalDate.now().toString());
            
            row++; // Empty row
            
            // Fund state section
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
            
            row++; // Empty row
            
            // Reader activity section
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
            
            row++; // Empty row
            
            // Popular books section
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
            
            // Auto-size columns
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
            PDPageContentStream cs = new PDPageContentStream(doc, page);
            float y = 750;
            float lineHeight = 14;
            
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, 16);
            cs.newLineAtOffset(50, y);
            cs.showText("ЗВІТ ПРО СТАН БІБЛІОТЕЧНОГО ФОНДУ");
            y -= 8;
            cs.newLineAtOffset(0, -lineHeight);
            
            cs.setFont(PDType1Font.HELVETICA, 10);
            cs.showText(java.time.LocalDate.now().toString());
            y -= 25;
            
            // Fund state section
            cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
            cs.newLineAtOffset(0, -y + 750);
            cs.showText("СТАН ФОНДУ");
            y -= 20;
            cs.setFont(PDType1Font.HELVETICA, 11);
            
            cs.newLineAtOffset(0, -y + 750);
            cs.showText("Всього примірників: " + dashboard.getTotalBooks());
            y -= lineHeight;
            
            cs.newLineAtOffset(0, -y + 750);
            cs.showText("В наявності: " + dashboard.getAvailableBooks());
            y -= lineHeight;
            
            cs.newLineAtOffset(0, -y + 750);
            cs.showText("Видані: " + dashboard.getIssuedBooks());
            y -= lineHeight;
            
            cs.newLineAtOffset(0, -y + 750);
            cs.showText("Прострочені: " + dashboard.getOverdueLoans());
            y -= 25;
            
            // Reader activity section
            if (y > 200) {
                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                cs.newLineAtOffset(0, -y + 750);
                cs.showText("АКТИВНІСТЬ ЧИТАЧІВ");
                y -= 18;
                
                cs.setFont(PDType1Font.HELVETICA, 10);
                for (DashboardDto.NamedCount reader : dashboard.getReaderActivity()) {
                    cs.newLineAtOffset(0, -y + 750);
                    cs.showText(reader.getName() + ": " + reader.getCount() + " видач");
                    y -= lineHeight;
                }
            }
            
            y -= 15;
            
            // Popular books section
            if (y > 100) {
                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                cs.newLineAtOffset(0, -y + 750);
                cs.showText("ПОПУЛЯРНІ КНИГИ");
                y -= 18;
                
                cs.setFont(PDType1Font.HELVETICA, 10);
                for (BookStats s : stats) {
                    if (y < 50) break; // Don't overflow the page
                    cs.newLineAtOffset(0, -y + 750);
                    cs.showText(s.getTitle() + " - " + s.getCount() + " видач");
                    y -= lineHeight;
                }
            }
            
            cs.endText();
            cs.close();
            doc.save(out);
            return out.toByteArray();
        }
    }
}
