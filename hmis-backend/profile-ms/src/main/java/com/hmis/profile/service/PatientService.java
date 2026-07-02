package com.hmis.profile.service;

import org.springframework.web.multipart.MultipartFile;

import com.hmis.profile.dto.PatientDto;
import com.hmis.profile.exception.HMSException;

public interface PatientService {

    Long addPatient(PatientDto patient) throws HMSException;
    PatientDto getPatient(Long id) throws HMSException;
    PatientDto updatePatient(long id, PatientDto patientDto) throws HMSException;
    String updateProfilePicture(Long patientId, MultipartFile file) throws HMSException;
    Boolean isPatientExists(Long id) throws HMSException;
}
