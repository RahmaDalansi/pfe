// GroupController.java
package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.GroupDto;
import com.example.scolarite.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/groups")
@PreAuthorize("hasRole('ADMIN')")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping
    public ResponseEntity<List<GroupDto>> getAllGroups(
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) Long levelId) {
        return ResponseEntity.ok(groupService.getAllGroups(activeOnly, levelId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDto> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @PostMapping
    public ResponseEntity<GroupDto> createGroup(@RequestBody GroupDto dto) {
        return ResponseEntity.ok(groupService.createGroup(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDto> updateGroup(@PathVariable Long id,
                                                @RequestBody GroupDto dto) {
        return ResponseEntity.ok(groupService.updateGroup(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteGroup(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            groupService.deleteGroup(id);
            response.put("success", true);
            response.put("message", "Groupe désactivé avec succès");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Map<String, Object>> hardDeleteGroup(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            groupService.hardDeleteGroup(id);
            response.put("success", true);
            response.put("message", "Groupe supprimé définitivement");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}