package com.hmis.profile.dto;

import java.time.LocalDate;

import com.hmis.profile.entity.Patient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientDto {

    private Long id;

    private String name;

    private String email;

    private LocalDate dob;

    private String phone;

    private String address;

    private String aadhaarNo;

    private BloodGroup bloodGroup;

    private String allergies;

    private String chronicDisease;

    public Patient toPatientEntity() {
        return new Patient(this.id, this.name, this.email, this.dob, this.phone, this.address, this.aadhaarNo,
                this.bloodGroup, this.allergies, this.chronicDisease);
    }
}
