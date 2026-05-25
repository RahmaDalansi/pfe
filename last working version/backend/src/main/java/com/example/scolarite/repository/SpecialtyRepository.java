// SpecialtyRepository.java
package com.example.scolarite.repository;

import com.example.scolarite.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {
    Optional<Specialty> findByCode(String code);
    List<Specialty> findByDepartmentId(Long departmentId);
    List<Specialty> findByDepartmentIdAndIsActiveTrue(Long departmentId);
    List<Specialty> findByIsActiveTrue();

    @Query("SELECT s FROM Specialty s LEFT JOIN FETCH s.levels WHERE s.id = :id")
    Optional<Specialty> findByIdWithLevels(@Param("id") Long id);

    @Query("SELECT s FROM Specialty s WHERE s.department.id = :departmentId")
    List<Specialty> findAllByDepartmentId(@Param("departmentId") Long departmentId);
}