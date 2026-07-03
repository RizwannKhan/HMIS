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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hmis.profile.dto.DoctorDropdown;
import com.hmis.profile.dto.DoctorDto;
import com.hmis.profile.exception.HMSException;
import com.hmis.profile.service.DoctorService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;


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

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) throws HMSException {
        return new ResponseEntity<>(doctorService.getDoctor(id), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<DoctorDto> updateDoctor(@PathVariable Long id, @RequestBody DoctorDto doctorDto) throws HMSException {       
        return new ResponseEntity<>(doctorService.updateDoctor(id, doctorDto), HttpStatus.OK);
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("avatar") MultipartFile file) throws IOException, HMSException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is empty");
        }

        String avatarUrl = doctorService.updateProfilePicture(id, file);

        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> isDoctorExists(@PathVariable Long id) throws HMSException {
        Boolean exists = doctorService.isDoctorExists(id);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/dropdown")
    public ResponseEntity<List<DoctorDropdown>> getDoctorsDropdown() throws HMSException {
        return ResponseEntity.ok(doctorService.getDoctorsDropdown());
    }

}
