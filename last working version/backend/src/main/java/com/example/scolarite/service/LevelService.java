// LevelService.java
package com.example.scolarite.service;

import com.example.scolarite.dto.LevelDto;
import com.example.scolarite.entity.Level;
import com.example.scolarite.entity.Specialty;
import com.example.scolarite.repository.LevelRepository;
import com.example.scolarite.repository.SpecialtyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LevelService {

    private final LevelRepository levelRepository;
    private final SpecialtyRepository specialtyRepository;

    public LevelService(LevelRepository levelRepository, SpecialtyRepository specialtyRepository) {
        this.levelRepository = levelRepository;
        this.specialtyRepository = specialtyRepository;
    }

    public List<LevelDto> getAllLevels(Boolean activeOnly, Long specialtyId) {
        List<Level> levels;

        if (specialtyId != null) {
            if (activeOnly != null && activeOnly) {
                levels = levelRepository.findBySpecialtyIdAndIsActiveTrue(specialtyId);
            } else {
                levels = levelRepository.findBySpecialtyId(specialtyId);
            }
        } else {
            if (activeOnly != null && activeOnly) {
                levels = levelRepository.findByIsActiveTrue();
            } else {
                levels = levelRepository.findAll();
            }
        }

        return levels.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public LevelDto getLevelById(Long id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));
        return mapToDto(level);
    }

    public LevelDto createLevel(LevelDto dto) {
        Specialty specialty = specialtyRepository.findById(dto.getSpecialtyId())
                .orElseThrow(() -> new RuntimeException("Spécialité non trouvée"));

        // Vérifier si le niveau existe déjà pour cette spécialité
        if (levelRepository.findBySpecialtyIdAndYearNumber(dto.getSpecialtyId(), dto.getYearNumber()).isPresent()) {
            throw new RuntimeException("Ce niveau existe déjà pour cette spécialité");
        }

        Level level = new Level();
        level.setYearNumber(dto.getYearNumber());
        level.setName(generateLevelName(dto.getYearNumber()));
        level.setSemesterCount(dto.getSemesterCount() != null ? dto.getSemesterCount() : 2);
        level.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        level.setSpecialty(specialty);

        level = levelRepository.save(level);
        return mapToDto(level);
    }

    public LevelDto updateLevel(Long id, LevelDto dto) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));

        if (dto.getYearNumber() != null && !dto.getYearNumber().equals(level.getYearNumber())) {
            if (levelRepository.findBySpecialtyIdAndYearNumber(level.getSpecialty().getId(), dto.getYearNumber()).isPresent()) {
                throw new RuntimeException("Ce niveau existe déjà pour cette spécialité");
            }
            level.setYearNumber(dto.getYearNumber());
            level.setName(generateLevelName(dto.getYearNumber()));
        }

        if (dto.getSemesterCount() != null) level.setSemesterCount(dto.getSemesterCount());
        if (dto.getIsActive() != null) level.setIsActive(dto.getIsActive());

        if (dto.getSpecialtyId() != null && !dto.getSpecialtyId().equals(level.getSpecialty().getId())) {
            Specialty specialty = specialtyRepository.findById(dto.getSpecialtyId())
                    .orElseThrow(() -> new RuntimeException("Spécialité non trouvée"));
            level.setSpecialty(specialty);
        }

        level = levelRepository.save(level);
        return mapToDto(level);
    }

    public void deleteLevel(Long id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));

        // Vérifier s'il y a des groupes associés
        if (!level.getGroups().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer un niveau qui a des groupes. Désactivez-le d'abord.");
        }

        level.setIsActive(false);
        levelRepository.save(level);
    }

    public void hardDeleteLevel(Long id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));

        if (!level.getGroups().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer définitivement un niveau qui a des groupes");
        }

        levelRepository.delete(level);
    }

    private String generateLevelName(Integer yearNumber) {
        switch (yearNumber) {
            case 1: return "1ère Année";
            case 2: return "2ème Année";
            case 3: return "3ème Année";
            default: return yearNumber + "ème Année";
        }
    }

    private LevelDto mapToDto(Level level) {
        LevelDto dto = new LevelDto();
        dto.setId(level.getId());
        dto.setYearNumber(level.getYearNumber());
        dto.setName(level.getName());
        dto.setSemesterCount(level.getSemesterCount());
        dto.setIsActive(level.getIsActive());
        dto.setSpecialtyId(level.getSpecialty().getId());
        dto.setSpecialtyName(level.getSpecialty().getName());
        dto.setGroupCount(level.getGroups().size());
        return dto;
    }
}