package com.onlinecourses.OnlineCourseSystem.controller;

import com.onlinecourses.OnlineCourseSystem.dto.CertificateRequest;
import com.onlinecourses.OnlineCourseSystem.dto.CertificateResponse;
import com.onlinecourses.OnlineCourseSystem.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "http://localhost:5173")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    // Generate certificate
    @PostMapping("/generate")
    public ResponseEntity<?> generateCertificate(@RequestBody CertificateRequest request) {
        try {
            CertificateResponse certificate = certificateService.generateCertificate(request);
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to generate certificate: " + e.getMessage()
            ));
        }
    }

    // Get all certificates for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CertificateResponse>> getStudentCertificates(@PathVariable Long studentId) {
        try {
            List<CertificateResponse> certificates = certificateService.getStudentCertificates(studentId);
            return ResponseEntity.ok(certificates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get certificate by ID
    @GetMapping("/{id}")
    public ResponseEntity<CertificateResponse> getCertificateById(@PathVariable Long id) {
        try {
            return certificateService.getCertificateById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get certificate by certificate ID
    @GetMapping("/certificate-id/{certificateId}")
    public ResponseEntity<CertificateResponse> getCertificateByCertificateId(@PathVariable String certificateId) {
        try {
            return certificateService.getCertificateByCertificateId(certificateId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get certificate by enrollment ID
    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<CertificateResponse> getCertificateByEnrollment(@PathVariable Long enrollmentId) {
        try {
            return certificateService.getCertificateByEnrollment(enrollmentId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Check if certificate exists for enrollment
    @GetMapping("/enrollment/{enrollmentId}/exists")
    public ResponseEntity<Boolean> checkCertificateExists(@PathVariable Long enrollmentId) {
        try {
            boolean exists = certificateService.certificateExistsForEnrollment(enrollmentId);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete certificate
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCertificate(@PathVariable Long id) {
        try {
            certificateService.deleteCertificate(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to delete certificate"
            ));
        }
    }

    // Download certificate (mock endpoint)
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadCertificate(@PathVariable Long id) {
        try {
            // In a real application, this would return the actual PDF file
            // For now, return the certificate URL
            return certificateService.getCertificateById(id)
                    .map(cert -> ResponseEntity.ok(Map.of(
                        "downloadUrl", cert.getCertificateUrl(),
                        "message", "Certificate download ready"
                    )))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to download certificate"
            ));
        }
    }
}