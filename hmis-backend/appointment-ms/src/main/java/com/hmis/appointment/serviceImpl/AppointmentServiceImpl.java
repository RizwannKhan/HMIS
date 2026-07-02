package com.hmis.appointment.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hmis.appointment.clients.ProfileClient;
import com.hmis.appointment.dto.AppointmentDetails;
import com.hmis.appointment.dto.AppointmentDto;
import com.hmis.appointment.dto.AppointmentStatus;
import com.hmis.appointment.dto.AppointmentType;
import com.hmis.appointment.dto.DoctorDto;
import com.hmis.appointment.dto.PatientDto;
import com.hmis.appointment.entity.Appointment;
import com.hmis.appointment.exception.HMSException;
import com.hmis.appointment.repository.AppointmentRepository;
import com.hmis.appointment.service.ApiService;
import com.hmis.appointment.service.AppointmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;

    private final ApiService apiService;

    private final ProfileClient profileClient;

    @Override
    public AppointmentDto scheduleAppointment(AppointmentDto appointmentDto) throws HMSException {
        if (appointmentDto.getPatientId() == null || appointmentDto.getDoctorId() == null) {
            throw new HMSException("PATIENT_OR_DOCTOR_ID_MISSING");
        }
        /* Boolean doctorExists = apiService.isDoctorProfileExists(appointmentDto.getDoctorId()).blockOptional()
                .orElseThrow(() -> new HMSException("DOCTOR_PROFILE_NOT_FOUND"));
        Boolean patientExists = apiService.isPatientProfileExists(appointmentDto.getPatientId()).blockOptional()
                .orElseThrow(() -> new HMSException("PATIENT_PROFILE_NOT_FOUND")); */
        Boolean doctorExists = profileClient.isDoctorExists(appointmentDto.getDoctorId());
        if(doctorExists == null || !doctorExists) {
            throw new HMSException("DOCTOR_PROFILE_NOT_FOUND");
        }
        Boolean patientExists = profileClient.isPatientExists(appointmentDto.getPatientId());
        if(patientExists == null || !patientExists) {
            throw new HMSException("PATIENT_PROFILE_NOT_FOUND");
        }
        if (appointmentDto.getStatus() == null) {
            appointmentDto.setStatus(AppointmentStatus.SCHEDULED);
        }
        if (appointmentDto.getType() == null) {
            appointmentDto.setType(AppointmentType.NEW);
        }
        if (appointmentDto.getAppointmentDateTime() == null) {
            appointmentDto.setAppointmentDateTime(LocalDateTime.now());
        }
        if (appointmentDto.getAppointmentDateTime().isBefore(LocalDateTime.now())) {
            throw new HMSException("APPOINTMENT_DATE_TIME_IN_PAST");
        }
        Appointment appointment = appointmentRepository.save(appointmentDto.toEntity());
        return appointment.toDto();
    }

    @Override
    public void cancelAppointment(Long id) throws HMSException {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new HMSException("APPOINTMENT_NOT_FOUND"));
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new HMSException("APPOINTMENT_ALREADY_COMPLETED");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new HMSException("APPOINTMENT_ALREADY_CANCELLED");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Override
    public void completeAppointment(Long id) throws HMSException {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new HMSException("APPOINTMENT_NOT_FOUND"));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
    }

    @Override
    public void rescheduleAppointment(Long id, String newDateTime) throws HMSException {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new HMSException("APPOINTMENT_NOT_FOUND"));
        // Implementation for rescheduling appointment
        appointment.setAppointmentDateTime(null);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        appointmentRepository.save(appointment);
    }

    @Override
    public AppointmentDto getAppointmentById(Long id) throws HMSException {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new HMSException("APPOINTMENT_NOT_FOUND"));
        return appointment.toDto();
    }

    @Override
    public List<AppointmentDto> getAppointmentsByPatientId(Long patientId) throws HMSException {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAppointmentsByPatientId'");
    }

    @Override
    public List<AppointmentDto> getAppointmentsByDoctorId(Long doctorId) throws HMSException {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAppointmentsByDoctorId'");
    }

    @Override
    public List<AppointmentDto> getAppointmentsByStatus(String status) throws HMSException {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAppointmentsByStatus'");
    }

    @Override
    public AppointmentDetails getAppointmentDetailsWithName(Long appointmentId) throws HMSException {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new HMSException("APPOINTMENT_NOT_FOUND"));

        // Fetch doctor and patient details using ApiService
        /* DoctorDto doctorProfile = apiService.getDoctorProfile(appointment.getDoctorId()).blockOptional()
                .orElseThrow(() -> new HMSException("DOCTOR_PROFILE_NOT_FOUND"));
        PatientDto patientProfile = apiService.getPatientProfile(appointment.getPatientId()).blockOptional()
                .orElseThrow(() -> new HMSException("PATIENT_PROFILE_NOT_FOUND")); */
        DoctorDto doctorProfile = profileClient.getDoctorById(appointment.getDoctorId());
        if(doctorProfile == null) {
            throw new HMSException("DOCTOR_PROFILE_NOT_FOUND");
        }

        PatientDto patientProfile = profileClient.getPatientById(appointment.getPatientId());
        if(patientProfile == null) {
            throw new HMSException("PATIENT_PROFILE_NOT_FOUND");
        }

        return AppointmentDetails.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .patientName(patientProfile.getName())
                .patientEmail(patientProfile.getEmail())
                .patientPhone(patientProfile.getPhone())
                .doctorId(appointment.getDoctorId())
                .doctorName(doctorProfile.getName())
                .appointmentDateTime(appointment.getAppointmentDateTime())
                .status(appointment.getStatus())
                .type(appointment.getType())
                .reasonForVisit(appointment.getReasonForVisit())
                .notes(appointment.getNotes())
                .build();
    }

}
