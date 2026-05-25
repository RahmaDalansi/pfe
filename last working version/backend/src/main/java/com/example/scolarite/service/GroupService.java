// GroupService.java
package com.example.scolarite.service;

import com.example.scolarite.dto.GroupDto;
import com.example.scolarite.entity.Group;
import com.example.scolarite.entity.Level;
import com.example.scolarite.repository.GroupRepository;
import com.example.scolarite.repository.LevelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final LevelRepository levelRepository;

    public GroupService(GroupRepository groupRepository, LevelRepository levelRepository) {
        this.groupRepository = groupRepository;
        this.levelRepository = levelRepository;
    }

    public List<GroupDto> getAllGroups(Boolean activeOnly, Long levelId) {
        List<Group> groups;

        if (levelId != null) {
            if (activeOnly != null && activeOnly) {
                groups = groupRepository.findByLevelIdAndIsActiveTrue(levelId);
            } else {
                groups = groupRepository.findByLevelId(levelId);
            }
        } else {
            if (activeOnly != null && activeOnly) {
                groups = groupRepository.findByIsActiveTrue();
            } else {
                groups = groupRepository.findAll();
            }
        }

        return groups.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public GroupDto getGroupById(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));
        return mapToDto(group);
    }

    public GroupDto createGroup(GroupDto dto) {
        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));

        // Vérifier si le groupe existe déjà pour ce niveau
        if (groupRepository.findByLevelIdAndGroupNumber(dto.getLevelId(), dto.getGroupNumber()).isPresent()) {
            throw new RuntimeException("Ce groupe existe déjà pour ce niveau");
        }

        Group group = new Group();
        group.setGroupNumber(dto.getGroupNumber());
        group.setName(dto.getName() != null ? dto.getName() : "Groupe " + dto.getGroupNumber());
        group.setStudentCount(dto.getStudentCount() != null ? dto.getStudentCount() : 0);
        group.setMaxCapacity(dto.getMaxCapacity() != null ? dto.getMaxCapacity() : 30);
        group.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        group.setLevel(level);

        group = groupRepository.save(group);
        return mapToDto(group);
    }

    public GroupDto updateGroup(Long id, GroupDto dto) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

        if (dto.getGroupNumber() != null && !dto.getGroupNumber().equals(group.getGroupNumber())) {
            if (groupRepository.findByLevelIdAndGroupNumber(group.getLevel().getId(), dto.getGroupNumber()).isPresent()) {
                throw new RuntimeException("Ce groupe existe déjà pour ce niveau");
            }
            group.setGroupNumber(dto.getGroupNumber());
            if (dto.getName() == null) {
                group.setName("Groupe " + dto.getGroupNumber());
            }
        }

        if (dto.getName() != null) group.setName(dto.getName());
        if (dto.getStudentCount() != null) group.setStudentCount(dto.getStudentCount());
        if (dto.getMaxCapacity() != null) group.setMaxCapacity(dto.getMaxCapacity());
        if (dto.getIsActive() != null) group.setIsActive(dto.getIsActive());

        if (dto.getLevelId() != null && !dto.getLevelId().equals(group.getLevel().getId())) {
            Level level = levelRepository.findById(dto.getLevelId())
                    .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));
            group.setLevel(level);
        }

        group = groupRepository.save(group);
        return mapToDto(group);
    }

    public void deleteGroup(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

        // Soft delete
        group.setIsActive(false);
        groupRepository.save(group);
    }

    public void hardDeleteGroup(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));
        groupRepository.delete(group);
    }

    private GroupDto mapToDto(Group group) {
        GroupDto dto = new GroupDto();
        dto.setId(group.getId());
        dto.setGroupNumber(group.getGroupNumber());
        dto.setName(group.getName());
        dto.setStudentCount(group.getStudentCount());
        dto.setMaxCapacity(group.getMaxCapacity());
        dto.setIsActive(group.getIsActive());
        dto.setLevelId(group.getLevel().getId());
        dto.setLevelName(group.getLevel().getName());
        dto.setSpecialtyId(group.getLevel().getSpecialty().getId());
        dto.setSpecialtyName(group.getLevel().getSpecialty().getName());
        dto.setDepartmentId(group.getLevel().getSpecialty().getDepartment().getId());
        dto.setDepartmentName(group.getLevel().getSpecialty().getDepartment().getName());
        return dto;
    }
}