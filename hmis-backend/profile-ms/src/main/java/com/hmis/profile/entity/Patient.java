package com.hmis.profile.entity;

import java.time.LocalDate;

import com.hmis.profile.dto.BloodGroup;
import com.hmis.profile.dto.PatientDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "T_PATIENTDETAILS")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private LocalDate dob;

    private String phone;

    private String address;

    @Column(unique = true)
    private String aadhaarNo;

    @Enumerated(EnumType.STRING)
    private BloodGroup bloodGroup;

    private String allergies;

    private String chronicDisease;

    public PatientDto toPatientDto() {
        return new PatientDto(this.id, this.name, this.email, this.dob, this.phone, this.address, this.aadhaarNo,
                this.bloodGroup, this.allergies, this.chronicDisease);
    }

}
