package com.hmis.profile.service;

import com.hmis.profile.dto.PatientDto;
import com.hmis.profile.exception.HMSException;

public interface PatientService {

    Long addPatient(PatientDto patient) throws HMSException;
    PatientDto getPatient(Long id) throws HMSException;
}
