package com.hmis.user.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.hmis.user.config.FeignClientInterceptor;
import com.hmis.user.dto.UserDto;



@FeignClient(name = "profile-ms", configuration = FeignClientInterceptor.class)
public interface ProfileClient {

    @PostMapping("/profile/doctor/add")
    Long addDoctorProfile(@RequestBody UserDto userDto);

    @PostMapping("/profile/patient/add")
    Long addPatientProfile(@RequestBody UserDto userDto);

}
