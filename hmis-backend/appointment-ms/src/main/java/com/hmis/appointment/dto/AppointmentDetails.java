package com.hmis.appointment.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class AppointmentDetails {

    private Long id;

    private Long patientId;

    private String patientName;

    private String patientEmail;

    private String patientPhone;

    private Long doctorId;

    private String doctorName;

    private LocalDateTime appointmentDateTime;

    private AppointmentStatus status;

    private AppointmentType type;

    private String reasonForVisit;

    private String notes;

}
