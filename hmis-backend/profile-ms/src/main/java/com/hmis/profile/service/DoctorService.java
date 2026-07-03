package com.hmis.profile.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.hmis.profile.dto.DoctorDropdown;
import com.hmis.profile.dto.DoctorDto;
import com.hmis.profile.exception.HMSException;

public interface DoctorService {

    Long addDoctor(DoctorDto doctor) throws HMSException;
    DoctorDto getDoctor(Long id) throws HMSException;
    DoctorDto updateDoctor(long id, DoctorDto doctorDto) throws HMSException;
    String updateProfilePicture(Long id, MultipartFile file)  throws HMSException;
    Boolean isDoctorExists(Long id) throws HMSException;
    List<DoctorDropdown> getDoctorsDropdown() throws HMSException;
}
