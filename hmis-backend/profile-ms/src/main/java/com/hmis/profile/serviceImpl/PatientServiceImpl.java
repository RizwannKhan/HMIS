package com.hmis.profile.serviceImpl;

import java.util.Optional;

import org.springframework.stereotype.Service;

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

    @Override
    public Long addPatient(PatientDto patientDto) throws HMSException {
        Optional<Patient> patientByEmail = patientRepository.findByEmail(patientDto.getEmail());
        if (patientByEmail.isPresent()) {
            throw new HMSException("PATIENT_ALREADY_EXISTS");
        }
        if(patientDto.getAadhaarNo() != null) {
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

}
