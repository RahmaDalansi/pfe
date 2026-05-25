// LevelRepository.java
package com.example.scolarite.repository;

import com.example.scolarite.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface LevelRepository extends JpaRepository<Level, Long> {
    List<Level> findBySpecialtyId(Long specialtyId);
    List<Level> findBySpecialtyIdAndIsActiveTrue(Long specialtyId);
    List<Level> findByIsActiveTrue();

    Optional<Level> findBySpecialtyIdAndYearNumber(Long specialtyId, Integer yearNumber);

    @Query("SELECT l FROM Level l LEFT JOIN FETCH l.groups WHERE l.id = :id")
    Optional<Level> findByIdWithGroups(@Param("id") Long id);
}