package com.hmis.appointment.service;

import java.util.List;

import com.hmis.appointment.dto.AppointmentDetails;
import com.hmis.appointment.dto.AppointmentDto;
import com.hmis.appointment.exception.HMSException;

public interface AppointmentService {

    AppointmentDto scheduleAppointment(AppointmentDto appointmentDto) throws HMSException;

    void cancelAppointment(Long id) throws HMSException;
    
    void completeAppointment(Long id) throws HMSException;
    
    void rescheduleAppointment(Long id, String newDateTime) throws HMSException;
    
    AppointmentDto getAppointmentById(Long id) throws HMSException;

    List<AppointmentDetails> getAppointmentsByPatientId(Long patientId) throws HMSException;

    List<AppointmentDto> getAppointmentsByDoctorId(Long doctorId) throws HMSException;

    List<AppointmentDto> getAppointmentsByStatus(String status) throws HMSException;

    AppointmentDetails getAppointmentDetailsWithName(Long appointmentId) throws HMSException;
}
