// SpecialtyService.java
package com.example.scolarite.service;

import com.example.scolarite.dto.SpecialtyDto;
import com.example.scolarite.entity.Department;
import com.example.scolarite.entity.Specialty;
import com.example.scolarite.repository.DepartmentRepository;
import com.example.scolarite.repository.SpecialtyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final DepartmentRepository departmentRepository;

    public SpecialtyService(SpecialtyRepository specialtyRepository,
                            DepartmentRepository departmentRepository) {
        this.specialtyRepository = specialtyRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<SpecialtyDto> getAllSpecialties(Boolean activeOnly, Long departmentId) {
        List<Specialty> specialties;

        if (departmentId != null) {
            if (activeOnly != null && activeOnly) {
                specialties = specialtyRepository.findByDepartmentIdAndIsActiveTrue(departmentId);
            } else {
                specialties = specialtyRepository.findByDepartmentId(departmentId);
            }
        } else {
            if (activeOnly != null && activeOnly) {
                specialties = specialtyRepository.findByIsActiveTrue();
            } else {
                specialties = specialtyRepository.findAll();
            }
        }

        return specialties.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SpecialtyDto getSpecialtyById(Long id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spécialité non trouvée"));
        return mapToDto(specialty);
    }

    public SpecialtyDto createSpecialty(SpecialtyDto dto) {
        // Vérifier si le code existe déjà
        if (specialtyRepository.findByCode(dto.getCode()).isPresent()) {
            throw new RuntimeException("Une spécialité avec ce code existe déjà");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));

        Specialty specialty = new Specialty();
        specialty.setCode(dto.getCode());
        specialty.setName(dto.getName());
        specialty.setDescription(dto.getDescription());
        specialty.setDurationYears(dto.getDurationYears() != null ? dto.getDurationYears() : 3);
        specialty.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        specialty.setDepartment(department);

        specialty = specialtyRepository.save(specialty);
        return mapToDto(specialty);
    }

    public SpecialtyDto updateSpecialty(Long id, SpecialtyDto dto) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spécialité non trouvée"));

        if (dto.getCode() != null && !dto.getCode().equals(specialty.getCode())) {
            if (specialtyRepository.findByCode(dto.getCode()).isPresent()) {
                throw new RuntimeException("Une spécialité avec ce code existe déjà");
            }
            specialty.setCode(dto.getCode());
        }

        if (dto.getName() != null) specialty.setName(dto.getName());
        if (dto.getDescription() != null) specialty.setDescription(dto.getDescription());
        if (dto.getDurationYears() != null) specialty.setDurationYears(dto.getDurationYears());
        if (dto.getIsActive() != null) specialty.setIsActive(dto.getIsActive());

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(specialty.getDepartment().getId())) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Département non trouvé"));
            specialty.setDepartment(department);
        }

        specialty = specialtyRepository.save(specialty);
        return mapToDto(specialty);
    }

    public void deleteSpecialty(Long id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spécialité non trouvée"));

        // Vérifier s'il y a des niveaux associés
        if (!specialty.getLevels().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer une spécialité qui a des niveaux. Désactivez-la d'abord.");
        }

        specialty.setIsActive(false);
        specialtyRepository.save(specialty);
    }

    public void hardDeleteSpecialty(Long id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spécialité non trouvée"));

        if (!specialty.getLevels().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer définitivement une spécialité qui a des niveaux");
        }

        specialtyRepository.delete(specialty);
    }

    private SpecialtyDto mapToDto(Specialty specialty) {
        SpecialtyDto dto = new SpecialtyDto();
        dto.setId(specialty.getId());
        dto.setCode(specialty.getCode());
        dto.setName(specialty.getName());
        dto.setDescription(specialty.getDescription());
        dto.setDurationYears(specialty.getDurationYears());
        dto.setIsActive(specialty.getIsActive());
        dto.setDepartmentId(specialty.getDepartment().getId());
        dto.setDepartmentName(specialty.getDepartment().getName());
        dto.setLevelCount(specialty.getLevels().size());
        return dto;
    }
}