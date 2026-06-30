package com.hmis.profile.dto;

import java.time.LocalDate;

import com.hmis.profile.entity.Doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDto {

    private Long id;

    private String name;

    private String email;

    private LocalDate dob;

    private String phone;

    private String address;

    private String licenseNo;

    private String specialization;

    private String department;

    private Integer totalExp;

    public Doctor toDoctorEntity() {
        return new Doctor(this.id, this.name, this.email, this.dob, this.phone, this.address, this.licenseNo,
                this.specialization, this.department, this.totalExp);
    }

}
