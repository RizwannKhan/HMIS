package com.hmis.profile.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hmis.profile.dto.PatientDto;
import com.hmis.profile.exception.HMSException;
import com.hmis.profile.service.PatientService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@Validated
@CrossOrigin
@RequestMapping("/profile/patient")
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Long> addPatient(@RequestBody PatientDto patientDto) throws HMSException {
        return new ResponseEntity<>(patientService.addPatient(patientDto), HttpStatus.CREATED);
    }

    @GetMapping("/get/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) throws HMSException {
        return new ResponseEntity<>(patientService.getPatient(id), HttpStatus.OK);
    }

}
