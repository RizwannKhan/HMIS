package com.hmis.appointment.entity;

import java.time.LocalDateTime;

import com.hmis.appointment.dto.AppointmentDto;
import com.hmis.appointment.dto.AppointmentStatus;
import com.hmis.appointment.dto.AppointmentType;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "t_appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;

    private Long doctorId;

    private LocalDateTime appointmentDateTime;

    private AppointmentStatus status;

    private AppointmentType type;

    private String reasonForVisit;

    private String notes;

    public AppointmentDto toDto() {
        return AppointmentDto.builder()
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
