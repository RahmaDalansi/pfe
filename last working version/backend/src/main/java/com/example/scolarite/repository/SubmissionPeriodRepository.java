// com.example.scolarite.repository/SubmissionPeriodRepository.java
package com.example.scolarite.repository;

import com.example.scolarite.entity.SubmissionPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubmissionPeriodRepository extends JpaRepository<SubmissionPeriod, Long> {

    Optional<SubmissionPeriod> findByIsDefaultTrue();

    @Query("SELECT sp FROM SubmissionPeriod sp WHERE sp.isActive = true AND sp.startDate <= :now AND sp.endDate >= :now")
    Optional<SubmissionPeriod> findCurrentPeriod(@Param("now") LocalDateTime now);

    List<SubmissionPeriod> findByIsActiveTrueOrderByStartDateDesc();

    @Query("SELECT sp FROM SubmissionPeriod sp WHERE sp.academicYear = :academicYear AND sp.semester = :semester")
    List<SubmissionPeriod> findByAcademicYearAndSemester(@Param("academicYear") String academicYear, @Param("semester") Integer semester);
}