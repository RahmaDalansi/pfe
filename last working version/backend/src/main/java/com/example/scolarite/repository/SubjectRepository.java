package com.example.scolarite.repository;

import com.example.scolarite.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByCode(String code);

    List<Subject> findByIsActiveTrue();

    @Query("SELECT s FROM Subject s WHERE s.semester = :semester AND s.isActive = true")
    List<Subject> findBySemester(@Param("semester") Integer semester);

    @Query("SELECT s FROM Subject s LEFT JOIN s.professorSubjects ps WHERE ps.professor.keycloakId = :keycloakId")
    List<Subject> findSubjectsByProfessorKeycloakId(@Param("keycloakId") String keycloakId);
}