package com.hmis.profile.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.hmis.profile.entity.Doctor;

public interface DoctorRepository extends CrudRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);
    Optional<Doctor> findByLicenseNo(String license);
}
