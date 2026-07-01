package com.hmis.appointment.dto;

import java.time.LocalDateTime;

import com.hmis.appointment.entity.Appointment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class AppointmentDto {

    private Long id;

    private Long patientId;

    private Long doctorId;

    private LocalDateTime appointmentDateTime;

    private AppointmentStatus status;

    private AppointmentType type;

    private String reasonForVisit;

    private String notes;

    public Appointment toEntity() {
        return Appointment.builder()
                .id(this.id)
                .patientId(this.patientId)
                .doctorId(this.doctorId)
                .appointmentDateTime(this.appointmentDateTime)
                .status(this.status)
                .type(this.type)
                .reasonForVisit(this.reasonForVisit)
                .notes(this.notes)
                .build();
    }

}
