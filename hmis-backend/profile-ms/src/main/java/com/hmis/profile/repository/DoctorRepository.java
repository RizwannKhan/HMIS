package com.hmis.profile.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.hmis.profile.dto.DoctorDropdown;
import com.hmis.profile.entity.Doctor;

public interface DoctorRepository extends CrudRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);
    Optional<Doctor> findByLicenseNo(String license);

    @Query("SELECT d.id AS id, d.name AS name, d.department AS department FROM Doctor d")
    List<DoctorDropdown> findAllDoctorDropdowns();
}
