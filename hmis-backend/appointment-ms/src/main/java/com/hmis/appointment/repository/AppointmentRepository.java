package com.hmis.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hmis.appointment.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

}
