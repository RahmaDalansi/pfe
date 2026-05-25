// DepartmentService.java
package com.example.scolarite.service;

import com.example.scolarite.dto.DepartmentDto;
import com.example.scolarite.entity.Department;
import com.example.scolarite.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentDto> getAllDepartments(Boolean activeOnly) {
        List<Department> departments;
        if (activeOnly != null && activeOnly) {
            departments = departmentRepository.findByIsActiveTrue();
        } else {
            departments = departmentRepository.findAll();
        }
        return departments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        return mapToDto(department);
    }

    public DepartmentDto createDepartment(DepartmentDto dto) {
        // Vérifier si le code existe déjà
        if (departmentRepository.findByCode(dto.getCode()).isPresent()) {
            throw new RuntimeException("Un département avec ce code existe déjà");
        }
        // Vérifier si le nom existe déjà
        if (departmentRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("Un département avec ce nom existe déjà");
        }

        Department department = new Department();
        department.setCode(dto.getCode());
        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        department.setHeadOfDepartment(dto.getHeadOfDepartment());
        department.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        department = departmentRepository.save(department);
        return mapToDto(department);
    }

    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));

        if (dto.getCode() != null && !dto.getCode().equals(department.getCode())) {
            if (departmentRepository.findByCode(dto.getCode()).isPresent()) {
                throw new RuntimeException("Un département avec ce code existe déjà");
            }
            department.setCode(dto.getCode());
        }

        if (dto.getName() != null && !dto.getName().equals(department.getName())) {
            if (departmentRepository.findByName(dto.getName()).isPresent()) {
                throw new RuntimeException("Un département avec ce nom existe déjà");
            }
            department.setName(dto.getName());
        }

        if (dto.getDescription() != null) department.setDescription(dto.getDescription());
        if (dto.getHeadOfDepartment() != null) department.setHeadOfDepartment(dto.getHeadOfDepartment());
        if (dto.getIsActive() != null) department.setIsActive(dto.getIsActive());

        department = departmentRepository.save(department);
        return mapToDto(department);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));

        // Vérifier s'il y a des spécialités associées
        if (!department.getSpecialties().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer un département qui a des spécialités. Désactivez-le d'abord.");
        }

        department.setIsActive(false);
        departmentRepository.save(department);
    }

    public void hardDeleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));

        if (!department.getSpecialties().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer définitivement un département qui a des spécialités");
        }

        departmentRepository.delete(department);
    }

    private DepartmentDto mapToDto(Department department) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getId());
        dto.setCode(department.getCode());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());
        dto.setHeadOfDepartment(department.getHeadOfDepartment());
        dto.setIsActive(department.getIsActive());
        dto.setSpecialtyCount(department.getSpecialties().size());
        return dto;
    }
}