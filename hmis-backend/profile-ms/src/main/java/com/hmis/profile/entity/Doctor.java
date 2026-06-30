package com.hmis.profile.entity;

import java.time.LocalDate;

import com.hmis.profile.dto.DoctorDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "M_DOCTORDETAILS")
public class Doctor {

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
    private String licenseNo;

    private String specialization;

    private String department;

    private Integer totalExp;

    public DoctorDto toDoctorDto() {
        return new DoctorDto(this.id, this.name, this.email, this.dob, this.phone, this.address, this.licenseNo,
                this.specialization, this.department, this.totalExp);
    }
}
