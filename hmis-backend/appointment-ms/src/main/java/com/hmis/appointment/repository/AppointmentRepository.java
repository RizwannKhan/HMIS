package com.hmis.appointment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hmis.appointment.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    /* @Query("SELECT new com.hmis.appointment.dto.AppointmentDetails(a.id, a.patientId, a.doctorId, a.appointmentDateTime, a.status, a.type) FROM Appointment a WHERE a.patientId = :patientId")
    List<AppointmentDetails> findAllByPatientId(Long patientId); */

}
