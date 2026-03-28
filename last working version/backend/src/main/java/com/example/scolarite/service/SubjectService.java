package com.example.scolarite.service;

import com.example.scolarite.dto.SubjectDto;
import com.example.scolarite.entity.Subject;
import com.example.scolarite.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public List<SubjectDto> getAllSubjects(Boolean activeOnly) {
        List<Subject> subjects;
        if (activeOnly != null && activeOnly) {
            subjects = subjectRepository.findByIsActiveTrue();
        } else {
            subjects = subjectRepository.findAll();
        }
        return subjects.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SubjectDto getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matière non trouvée"));
        return mapToDto(subject);
    }

    public SubjectDto createSubject(SubjectDto subjectDto) {
        // Vérifier si le code existe déjà
        if (subjectRepository.findByCode(subjectDto.getCode()).isPresent()) {
            throw new RuntimeException("Une matière avec ce code existe déjà");
        }

        Subject subject = new Subject();
        subject.setCode(subjectDto.getCode());
        subject.setName(subjectDto.getName());
        subject.setDescription(subjectDto.getDescription());
        subject.setWeeklyHours(subjectDto.getWeeklyHours());
        subject.setSemester(subjectDto.getSemester());
        subject.setCredits(subjectDto.getCredits());
        subject.setIsActive(true);

        subject = subjectRepository.save(subject);
        return mapToDto(subject);
    }

    public SubjectDto updateSubject(Long id, SubjectDto subjectDto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matière non trouvée"));

        // Vérifier si le nouveau code est unique
        if (subjectDto.getCode() != null && !subjectDto.getCode().equals(subject.getCode())) {
            if (subjectRepository.findByCode(subjectDto.getCode()).isPresent()) {
                throw new RuntimeException("Une matière avec ce code existe déjà");
            }
            subject.setCode(subjectDto.getCode());
        }

        if (subjectDto.getName() != null) {
            subject.setName(subjectDto.getName());
        }
        if (subjectDto.getDescription() != null) {
            subject.setDescription(subjectDto.getDescription());
        }
        if (subjectDto.getWeeklyHours() != null) {
            subject.setWeeklyHours(subjectDto.getWeeklyHours());
        }
        if (subjectDto.getSemester() != null) {
            subject.setSemester(subjectDto.getSemester());
        }
        if (subjectDto.getCredits() != null) {
            subject.setCredits(subjectDto.getCredits());
        }
        if (subjectDto.getIsActive() != null) {
            subject.setIsActive(subjectDto.getIsActive());
        }

        subject = subjectRepository.save(subject);
        return mapToDto(subject);
    }

    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matière non trouvée"));

        // Soft delete : désactiver au lieu de supprimer
        subject.setIsActive(false);
        subjectRepository.save(subject);
    }

    public List<SubjectDto> getSubjectsBySemester(Integer semester) {
        List<Subject> subjects = subjectRepository.findBySemester(semester);
        return subjects.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private SubjectDto mapToDto(Subject subject) {
        SubjectDto dto = new SubjectDto();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setDescription(subject.getDescription());
        dto.setWeeklyHours(subject.getWeeklyHours());
        dto.setSemester(subject.getSemester());
        dto.setCredits(subject.getCredits());
        dto.setIsActive(subject.getIsActive());
        return dto;
    }
}