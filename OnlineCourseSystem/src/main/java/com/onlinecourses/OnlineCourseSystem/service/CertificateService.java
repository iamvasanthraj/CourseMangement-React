package com.onlinecourses.OnlineCourseSystem.service;

import com.onlinecourses.OnlineCourseSystem.dto.CertificateRequest;
import com.onlinecourses.OnlineCourseSystem.dto.CertificateResponse;
import com.onlinecourses.OnlineCourseSystem.entity.Certificate;
import com.onlinecourses.OnlineCourseSystem.entity.Enrollment;
import com.onlinecourses.OnlineCourseSystem.repository.CertificateRepository;
import com.onlinecourses.OnlineCourseSystem.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    public CertificateResponse generateCertificate(CertificateRequest request) {
        // Check if enrollment exists and is completed
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(request.getEnrollmentId());
        if (enrollmentOpt.isEmpty()) {
            throw new RuntimeException("Enrollment not found");
        }

        Enrollment enrollment = enrollmentOpt.get();
        
        if (!enrollment.isCompleted()) {
            throw new RuntimeException("Course must be completed before generating certificate");
        }

        // Check if certificate already exists
        Optional<Certificate> existingCertificate = certificateRepository.findByEnrollmentId(request.getEnrollmentId());
        if (existingCertificate.isPresent()) {
            return convertToResponse(existingCertificate.get());
        }

        // Create new certificate
        Certificate certificate = new Certificate();
        certificate.setEnrollment(enrollment);
        certificate.setStudentName(request.getStudentName());
        certificate.setCourseTitle(request.getCourseTitle());
        certificate.setCourseCategory(request.getCourseCategory());
        certificate.setInstructorName(request.getInstructorName());
        certificate.setScore(request.getScore());
        certificate.setCompletionDate(enrollment.getCompletionDate());
        
        // Generate certificate URL (mock for now)
        certificate.setCertificateUrl("/certificates/" + certificate.getCertificateId() + ".pdf");

        Certificate savedCertificate = certificateRepository.save(certificate);
        return convertToResponse(savedCertificate);
    }

    public List<CertificateResponse> getStudentCertificates(Long studentId) {
        List<Certificate> certificates = certificateRepository.findByEnrollmentStudentId(studentId);
        return certificates.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public Optional<CertificateResponse> getCertificateById(Long id) {
        return certificateRepository.findById(id)
                .map(this::convertToResponse);
    }

    public Optional<CertificateResponse> getCertificateByCertificateId(String certificateId) {
        return certificateRepository.findByCertificateId(certificateId)
                .map(this::convertToResponse);
    }

    public Optional<CertificateResponse> getCertificateByEnrollment(Long enrollmentId) {
        return certificateRepository.findByEnrollmentId(enrollmentId)
                .map(this::convertToResponse);
    }

    public void deleteCertificate(Long id) {
        certificateRepository.deleteById(id);
    }

    public boolean certificateExistsForEnrollment(Long enrollmentId) {
        return certificateRepository.existsByEnrollmentId(enrollmentId);
    }

    private CertificateResponse convertToResponse(Certificate certificate) {
        CertificateResponse response = new CertificateResponse();
        response.setId(certificate.getId());
        response.setCertificateId(certificate.getCertificateId());
        response.setStudentName(certificate.getStudentName());
        response.setCourseTitle(certificate.getCourseTitle());
        response.setCourseCategory(certificate.getCourseCategory());
        response.setInstructorName(certificate.getInstructorName());
        response.setIssueDate(certificate.getIssueDate());
        response.setCompletionDate(certificate.getCompletionDate());
        response.setScore(certificate.getScore());
        response.setCertificateUrl(certificate.getCertificateUrl());
        return response;
    }
}