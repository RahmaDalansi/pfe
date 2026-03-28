package com.example.scolarite.repository;

import com.example.scolarite.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {

    Optional<Professor> findByKeycloakId(String keycloakId);

    @Query("SELECT p FROM Professor p WHERE p.keycloakId IN :keycloakIds")
    List<Professor> findAllByKeycloakIds(@Param("keycloakIds") List<String> keycloakIds);

    @Query("SELECT p FROM Professor p LEFT JOIN FETCH p.professorSubjects ps LEFT JOIN FETCH ps.subject WHERE p.keycloakId = :keycloakId")
    Optional<Professor> findByKeycloakIdWithSubjects(@Param("keycloakId") String keycloakId);

    boolean existsByKeycloakId(String keycloakId);
}