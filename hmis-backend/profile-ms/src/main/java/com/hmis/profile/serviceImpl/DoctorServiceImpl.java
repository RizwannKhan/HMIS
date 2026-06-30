package com.hmis.profile.serviceImpl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hmis.profile.dto.DoctorDto;
import com.hmis.profile.entity.Doctor;
import com.hmis.profile.exception.HMSException;
import com.hmis.profile.repository.DoctorRepository;
import com.hmis.profile.service.DoctorService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    @Override
    public Long addDoctor(DoctorDto doctorDto) throws HMSException {
        Optional<Doctor> DoctorbyEmail = doctorRepository.findByEmail(doctorDto.getEmail());
        if (DoctorbyEmail.isPresent()) {
            throw new HMSException("DOCTOR_ALREADY_EXISTS");
        }
        if(doctorDto.getLicenseNo() != null) {
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

}
