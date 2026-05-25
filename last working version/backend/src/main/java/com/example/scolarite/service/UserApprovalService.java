package com.example.scolarite.service;

import com.example.scolarite.entity.Professor;
import com.example.scolarite.entity.Student;
import com.example.scolarite.entity.TeachingPreferences;
import com.example.scolarite.repository.ProfessorRepository;
import com.example.scolarite.repository.StudentRepository;
import com.example.scolarite.repository.TeachingPreferencesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserApprovalService {

    private final ProfessorRepository professorRepository;
    private final TeachingPreferencesRepository teachingPreferencesRepository;
    private final StudentRepository studentRepository; // À créer si nécessaire

    public UserApprovalService(ProfessorRepository professorRepository,
                               TeachingPreferencesRepository teachingPreferencesRepository,
                               StudentRepository studentRepository) {
        this.professorRepository = professorRepository;
        this.teachingPreferencesRepository = teachingPreferencesRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public void handleUserApproval(String keycloakId, List<String> roles) {
        // Création pour PROFESSEUR
        if (roles.contains("PROFESSOR") && !professorRepository.existsByKeycloakId(keycloakId)) {
            Professor professor = new Professor(keycloakId);
            professor = professorRepository.save(professor);
            System.out.println("✅ Professeur créé dans la base métier: " + keycloakId);

            // Créer les préférences d'enseignement associées
            TeachingPreferences preferences = new TeachingPreferences(professor);
            teachingPreferencesRepository.save(preferences);
            System.out.println("✅ Préférences d'enseignement créées pour le professeur: " + keycloakId);
        }

        // Création pour ÉTUDIANT
        if (roles.contains("STUDENT") && studentRepository != null && !studentRepository.existsByKeycloakId(keycloakId)) {
            Student student = new Student(keycloakId);
            studentRepository.save(student);
            System.out.println("✅ Étudiant créé dans la base métier: " + keycloakId);
        }

        // Note: ADMIN n'a pas besoin de table spécifique (géré par Keycloak)
    }
}