package com.hmis.appointment.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.hmis.appointment.config.FeignClientInterceptor;
import com.hmis.appointment.dto.DoctorDto;
import com.hmis.appointment.dto.PatientDto;

@FeignClient(name = "profile-ms", configuration = FeignClientInterceptor.class)
public interface ProfileClient {

    @GetMapping("/profile/doctor/exists/{id}")
    Boolean isDoctorExists(@PathVariable("id") Long id);

    @GetMapping("/profile/patient/exists/{id}")
    Boolean isPatientExists(@PathVariable("id") Long id);

    @GetMapping("/profile/doctor/{id}")
    DoctorDto getDoctorById(@PathVariable("id") Long id);

    @GetMapping("/profile/patient/{id}")
    PatientDto getPatientById(@PathVariable("id") Long id);

}
