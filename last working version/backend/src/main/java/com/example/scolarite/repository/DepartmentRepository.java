// DepartmentRepository.java
package com.example.scolarite.repository;

import com.example.scolarite.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByCode(String code);
    Optional<Department> findByName(String name);
    List<Department> findByIsActiveTrue();

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.specialties WHERE d.id = :id")
    Optional<Department> findByIdWithSpecialties(@Param("id") Long id);
}