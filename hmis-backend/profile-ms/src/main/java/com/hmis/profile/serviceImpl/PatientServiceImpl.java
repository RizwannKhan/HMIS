package com.hmis.profile.serviceImpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.hmis.profile.dto.PatientDto;
import com.hmis.profile.entity.Patient;
import com.hmis.profile.exception.HMSException;
import com.hmis.profile.repository.PatientRepository;
import com.hmis.profile.service.PatientService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @Value("${app.public-base-url}")
    private String appPublicBaseUrl;

    @Override
    public Long addPatient(PatientDto patientDto) throws HMSException {
        Optional<Patient> patientByEmail = patientRepository.findByEmail(patientDto.getEmail());
        if (patientByEmail.isPresent()) {
            throw new HMSException("PATIENT_ALREADY_EXISTS");
        }
        if (patientDto.getAadhaarNo() != null) {
            Optional<Patient> patientByAadhaar = patientRepository.findByAadhaarNo(patientDto.getAadhaarNo());
            if (patientByAadhaar.isPresent()) {
                throw new HMSException("PATIENT_ALREADY_EXISTS");
            }
        }
        return patientRepository.save(patientDto.toPatientEntity()).getId();
    }

    @Override
    public PatientDto getPatient(Long id) throws HMSException {
        return patientRepository.findById(id).orElseThrow(() -> new HMSException("PATIENT_NOT_FOUND")).toPatientDto();
    }

    @Override
    public PatientDto updatePatient(long id, PatientDto patientDto) throws HMSException {
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new HMSException("PATIENT_NOT_FOUND"));
        patient.setAddress(patientDto.getAddress());
        patient.setPhone(patientDto.getPhone());
        patient.setBloodGroup(patientDto.getBloodGroup());
        patient.setAllergies(patientDto.getAllergies());
        patient.setChronicDisease(patientDto.getChronicDisease());
        if (patientDto.getAadhaarNo() != null) {
            Optional<Patient> patientByAadhaar = patientRepository.findByAadhaarNo(patientDto.getAadhaarNo());
            if (patientByAadhaar.isPresent() && !patientByAadhaar.get().getId().equals(id)) {
                throw new HMSException("PATIENT_ALREADY_EXISTS");
            }
            patient.setAadhaarNo(patientDto.getAadhaarNo());
        }
        if (patientDto.getDob() != null) {
            patient.setDob(patientDto.getDob());
        }
        return patientRepository.save(patient).toPatientDto();
    }

    @Override
    public String updateProfilePicture(Long patientId, MultipartFile file) throws HMSException {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new HMSException("PATIENT_NOT_FOUND"));
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String filename = "patient-" + patientId + "-" + UUID.randomUUID() + "." + extension;
        try {
            Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(baseDir);
            Path target = baseDir.resolve(filename);
            System.out.println("Saving avatar to: " + target.toAbsolutePath());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            e.printStackTrace();
        }

        String avatarUrl = appPublicBaseUrl + "/static/avatars/" + filename;
        patient.setAvatarUrl(avatarUrl);
        patientRepository.save(patient);
        return avatarUrl;
    }

}
