package com.hmis.profile.service;

import com.hmis.profile.dto.DoctorDto;
import com.hmis.profile.exception.HMSException;

public interface DoctorService {

    Long addDoctor(DoctorDto doctor) throws HMSException;
    DoctorDto getDoctor(Long id) throws HMSException;

}
