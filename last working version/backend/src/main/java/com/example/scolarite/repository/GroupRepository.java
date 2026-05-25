// GroupRepository.java
package com.example.scolarite.repository;

import com.example.scolarite.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByLevelId(Long levelId);
    List<Group> findByLevelIdAndIsActiveTrue(Long levelId);
    List<Group> findByIsActiveTrue();

    Optional<Group> findByLevelIdAndGroupNumber(Long levelId, Integer groupNumber);

    @Query("SELECT g FROM Group g WHERE g.level.specialty.department.id = :departmentId")
    List<Group> findAllByDepartmentId(Long departmentId);
}