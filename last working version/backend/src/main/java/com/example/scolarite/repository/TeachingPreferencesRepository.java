package com.example.scolarite.repository;

import com.example.scolarite.entity.TeachingPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TeachingPreferencesRepository extends JpaRepository<TeachingPreferences, Long> {

    Optional<TeachingPreferences> findByProfessorId(Long professorId);

    @Query("SELECT tp FROM TeachingPreferences tp WHERE tp.professor.keycloakId = :keycloakId")
    Optional<TeachingPreferences> findByProfessorKeycloakId(@Param("keycloakId") String keycloakId);

    List<TeachingPreferences> findByIsSubmittedTrue();

    @Query("SELECT tp FROM TeachingPreferences tp WHERE tp.submissionPeriodId = :periodId AND tp.isSubmitted = true")
    List<TeachingPreferences> findBySubmissionPeriodId(@Param("periodId") Long periodId);
}