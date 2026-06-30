package com.hmis.user.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.hmis.user.dto.Roles;
import com.hmis.user.dto.UserDto;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ApiService {

    private final WebClient.Builder webClient;

    public Mono<Long> addProfile(UserDto userDto) {
        if (userDto.getRole().equals(Roles.DOCTOR)) {
            return webClient.build().post().uri("http://localhost:9092/profile/doctor/add").bodyValue(userDto)
                    .retrieve().bodyToMono(Long.class);
        } else if(userDto.getRole().equals(Roles.PATIENT)) {
            return webClient.build().post().uri("http://localhost:9092/profile/patient/add").bodyValue(userDto)
                    .retrieve().bodyToMono(Long.class);
        }
        return null;
    }

}
