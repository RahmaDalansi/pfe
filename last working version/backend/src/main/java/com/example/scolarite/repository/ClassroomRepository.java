package com.example.scolarite.repository;

import com.example.scolarite.entity.Classroom;
import com.example.scolarite.entity.ClassroomType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByIsActiveTrue();
    List<Classroom> findByType(ClassroomType type);
}