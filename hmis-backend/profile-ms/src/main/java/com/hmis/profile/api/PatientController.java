package com.hmis.profile.api;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hmis.profile.dto.PatientDropdown;
import com.hmis.profile.dto.PatientDto;
import com.hmis.profile.exception.HMSException;
import com.hmis.profile.service.PatientService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

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

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) throws HMSException {
        return new ResponseEntity<>(patientService.getPatient(id), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<PatientDto> updatePatient(@PathVariable Long id, @RequestBody PatientDto patientDto)
            throws HMSException {
        try {
            PatientDto updatedPatientDto = patientService.updatePatient(id, patientDto);
            return ResponseEntity.ok(updatedPatientDto);
        } catch (HMSException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("avatar") MultipartFile file) throws IOException, HMSException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is empty");
        }
        System.out.println("Received file: " + file.getOriginalFilename() + ", size=" + file.getSize());
        String avatarUrl = patientService.updateProfilePicture(id, file);

        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> isPatientExists(@PathVariable Long id) throws HMSException {
        Boolean exists = patientService.isPatientExists(id);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/dropdown")
    public ResponseEntity<List<PatientDropdown>> getPatientsDropdown() throws HMSException {
        return ResponseEntity.ok(patientService.getPatientDropdown());
    }

}
