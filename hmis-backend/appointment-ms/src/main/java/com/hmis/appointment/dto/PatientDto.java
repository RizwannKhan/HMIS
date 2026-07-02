package com.hmis.appointment.dto;

import java.time.LocalDate;

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

    private String avatarUrl;
}
