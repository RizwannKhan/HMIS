package com.hmis.profile.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.hmis.profile.entity.Patient;


public interface PatientRepository extends CrudRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByAadhaarNo(String aadhaar);
}
