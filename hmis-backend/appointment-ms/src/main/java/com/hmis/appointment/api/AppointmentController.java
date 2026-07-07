package com.hmis.appointment.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hmis.appointment.dto.AppointmentDetails;
import com.hmis.appointment.dto.AppointmentDto;
import com.hmis.appointment.exception.HMSException;
import com.hmis.appointment.service.AppointmentService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;




@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/schedule")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<AppointmentDto> postMethodName(@RequestBody AppointmentDto appointmentDto) throws HMSException {
        appointmentDto = appointmentService.scheduleAppointment(appointmentDto);        
        return ResponseEntity.ok(appointmentDto);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable Long id) throws HMSException {
        AppointmentDto appointmentDto = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointmentDto);
    }
    
    @PutMapping("/cancel/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<String> cancelAppointment(@PathVariable Long id) throws HMSException {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok("Appointment cancelled successfully");
    }

    @GetMapping("/get/details/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<AppointmentDetails> getAppointmentDetailsWithName(@PathVariable Long id) throws HMSException {
        AppointmentDetails appointmentDetails = appointmentService.getAppointmentDetailsWithName(id);
        return ResponseEntity.ok(appointmentDetails);
    }

    @GetMapping("/patient/{patientId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<AppointmentDetails>> getAppointmentsByPatientId(@PathVariable Long patientId) throws HMSException {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<AppointmentDetails>> getAppointmentsByDoctorId(@PathVariable Long doctorId) throws HMSException {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorId(doctorId));
    }

    @PutMapping("/update/status/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<String> updateAppointmentStatus(@PathVariable Long id, @RequestBody AppointmentDto appointmentDto) throws HMSException {
        appointmentService.updateAppointmentStatus(id, appointmentDto.getStatus().toString());
        return ResponseEntity.ok("Appointment status updated successfully");
    }

}
