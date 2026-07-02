package com.hmis.appointment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AppointmentMsApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppointmentMsApplication.class, args);
	}

}
