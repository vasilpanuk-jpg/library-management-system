package com.library.controller;

import com.library.dto.BookStats;
import com.library.dto.DashboardDto;
import com.library.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Аналітика та експорт звітів")
@SecurityRequirement(name = "sessionCookie")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Зведені показники для дашборду")
    public DashboardDto dashboard() {
        return reportService.dashboard();
    }

    @GetMapping("/popular-books")
    @Operation(summary = "Найпопулярніші книги")
    public List<BookStats> popular() {
        return reportService.topBooks();
    }

    @GetMapping("/export")
    @Operation(summary = "Експорт звіту у PDF або Excel")
    public ResponseEntity<byte[]> export(@RequestParam(defaultValue = "excel") String type) throws Exception {
        if ("pdf".equalsIgnoreCase(type)) {
            byte[] data = reportService.exportPdf();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(data);
        }
        byte[] data = reportService.exportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.xlsx")
                .contentType(MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}
