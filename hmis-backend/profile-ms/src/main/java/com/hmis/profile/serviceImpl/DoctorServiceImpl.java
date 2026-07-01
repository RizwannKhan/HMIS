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

import com.hmis.profile.dto.DoctorDto;
import com.hmis.profile.entity.Doctor;
import com.hmis.profile.entity.Patient;
import com.hmis.profile.exception.HMSException;
import com.hmis.profile.repository.DoctorRepository;
import com.hmis.profile.service.DoctorService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.public-base-url}")
    private String appPublicBaseUrl;

    @Override
    public Long addDoctor(DoctorDto doctorDto) throws HMSException {
        Optional<Doctor> DoctorbyEmail = doctorRepository.findByEmail(doctorDto.getEmail());
        if (DoctorbyEmail.isPresent()) {
            throw new HMSException("DOCTOR_ALREADY_EXISTS");
        }
        if (doctorDto.getLicenseNo() != null) {
            Optional<Doctor> DoctorbyLicense = doctorRepository.findByLicenseNo(doctorDto.getLicenseNo());
            if (DoctorbyLicense.isPresent()) {
                throw new HMSException("DOCTOR_LICENSE_ALREADY_EXISTS");
            }
        }
        return doctorRepository.save(doctorDto.toDoctorEntity()).getId();
    }

    @Override
    public DoctorDto getDoctor(Long id) throws HMSException {
        return doctorRepository.findById(id).orElseThrow(() -> new HMSException("DOCTOR_NOT_FOUND")).toDoctorDto();
    }

    @Override
    public DoctorDto updateDoctor(long id, DoctorDto doctorDto) throws HMSException {
        Doctor doctor = doctorRepository.findById(id).orElseThrow(() -> new HMSException("DOCTOR_NOT_FOUND"));
        doctor.setAddress(doctorDto.getAddress());
        doctor.setPhone(doctorDto.getPhone());
        doctor.setSpecialization(doctorDto.getSpecialization());
        doctor.setDepartment(doctorDto.getDepartment());
        doctor.setTotalExp(doctorDto.getTotalExp());
        if (doctorDto.getLicenseNo() != null) {
            Optional<Doctor> DoctorbyLicense = doctorRepository.findByLicenseNo(doctorDto.getLicenseNo());
            if (DoctorbyLicense.isPresent() && !DoctorbyLicense.get().getId().equals(id)) {
                throw new HMSException("DOCTOR_LICENSE_ALREADY_EXISTS");
            }
            doctor.setLicenseNo(doctorDto.getLicenseNo());
        }
        if (doctorDto.getDob() != null) {
            doctor.setDob(doctorDto.getDob());
        }

        return doctorRepository.save(doctor).toDoctorDto();
    }

    @Override
    public String updateProfilePicture(Long doctorId, MultipartFile file) throws HMSException {
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new HMSException("DOCTOR_NOT_FOUND"));
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String filename = "doctor-" + doctorId + "-" + UUID.randomUUID() + "." + extension;
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
        doctor.setAvatarUrl(avatarUrl);
        doctorRepository.save(doctor);
        return avatarUrl;
    }

}
