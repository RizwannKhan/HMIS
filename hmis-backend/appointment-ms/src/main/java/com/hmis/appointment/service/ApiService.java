package com.hmis.appointment.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.hmis.appointment.dto.DoctorDto;
import com.hmis.appointment.dto.PatientDto;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ApiService {

    private final WebClient.Builder webClient;

    public Mono<Boolean> isDoctorProfileExists(Long userId) {
        return webClient.build().get().uri("http://localhost:9092/profile/doctor/exists/{userId}", userId)
                .retrieve().bodyToMono(Boolean.class);
    }

    public Mono<DoctorDto> getDoctorProfile(Long docId) {
        return webClient.build().get().uri("http://localhost:9092/profile/doctor/{docId}", docId)
                .retrieve().bodyToMono(DoctorDto.class);
    }

    public Mono<Boolean> isPatientProfileExists(Long userId) {
        return webClient.build().get().uri("http://localhost:9092/profile/patient/exists/{userId}", userId)
                .retrieve().bodyToMono(Boolean.class);
    }

    public Mono<PatientDto> getPatientProfile(Long patientId) {
        return webClient.build().get().uri("http://localhost:9092/profile/patient/{patientId}", patientId)
                .retrieve().bodyToMono(PatientDto.class);
    }

}
