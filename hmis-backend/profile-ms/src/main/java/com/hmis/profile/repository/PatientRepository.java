package com.hmis.profile.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.hmis.profile.dto.PatientDropdown;
import com.hmis.profile.entity.Patient;


public interface PatientRepository extends CrudRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByAadhaarNo(String aadhaar);

    @Query("SELECT d.id AS id, d.name AS name, d.email AS email, d.phone AS phone FROM Patient d")
    List<PatientDropdown> findAllPatientDropdowns();
}
