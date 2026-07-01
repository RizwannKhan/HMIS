package com.hmis.profile.service;

import org.springframework.web.multipart.MultipartFile;

import com.hmis.profile.dto.DoctorDto;
import com.hmis.profile.exception.HMSException;

public interface DoctorService {

    Long addDoctor(DoctorDto doctor) throws HMSException;
    DoctorDto getDoctor(Long id) throws HMSException;
    DoctorDto updateDoctor(long id, DoctorDto doctorDto) throws HMSException;
    String updateProfilePicture(Long id, MultipartFile file)  throws HMSException;

}
