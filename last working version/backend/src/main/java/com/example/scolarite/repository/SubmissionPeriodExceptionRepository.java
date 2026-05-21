// com.example.scolarite.repository/SubmissionPeriodExceptionRepository.java
package com.example.scolarite.repository;

import com.example.scolarite.entity.Professor;
import com.example.scolarite.entity.SubmissionPeriod;
import com.example.scolarite.entity.SubmissionPeriodException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubmissionPeriodExceptionRepository extends JpaRepository<SubmissionPeriodException, Long> {

    Optional<SubmissionPeriodException> findByProfessorAndPeriod(Professor professor, SubmissionPeriod period);

    List<SubmissionPeriodException> findByPeriod(SubmissionPeriod period);

    @Query("SELECT e FROM SubmissionPeriodException e WHERE e.professor = :professor AND e.endDate >= :now")
    List<SubmissionPeriodException> findActiveExceptionsByProfessor(@Param("professor") Professor professor, @Param("now") LocalDateTime now);

    void deleteByProfessorAndPeriod(Professor professor, SubmissionPeriod period);
}