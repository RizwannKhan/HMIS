package com.hmis.profile.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hmis.profile.dto.DoctorDto;
import com.hmis.profile.exception.HMSException;
import com.hmis.profile.service.DoctorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Validated
@CrossOrigin
@RequestMapping("/profile/doctor")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Long> addDoctor(@RequestBody DoctorDto doctorDto) throws HMSException {
        return new ResponseEntity<>(doctorService.addDoctor(doctorDto), HttpStatus.CREATED);
    }

    @GetMapping("/get/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) throws HMSException {
        return new ResponseEntity<>(doctorService.getDoctor(id), HttpStatus.OK);
    }

}
