package com.hmis.appointment.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hmis.appointment.dto.AppointmentDto;
import com.hmis.appointment.exception.HMSException;
import com.hmis.appointment.service.AppointmentService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;




@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class AppintmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/schedule")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<AppointmentDto> postMethodName(@RequestBody AppointmentDto appointmentDto) throws HMSException {
        appointmentDto = appointmentService.scheduleAppointment(appointmentDto);        
        return ResponseEntity.ok(appointmentDto);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<AppointmentDto> getAppointmentDetailsById(@PathVariable Long id) throws HMSException {
        AppointmentDto appointmentDto = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointmentDto);
    }
    
    @PutMapping("/cancel/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<String> cancelAppointment(@PathVariable Long id) throws HMSException {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok("Appointment cancelled successfully");
    }
    

}
