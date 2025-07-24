package com.codearena.backend.controller;

import com.codearena.backend.dto.ProblemCreateDTO;
import com.codearena.backend.dto.ProblemUpdateDTO;
import com.codearena.backend.entity.Role;
import com.codearena.backend.entity.User;
import com.codearena.backend.repository.ProblemRepository;
import com.codearena.backend.repository.RoleRepository;
import com.codearena.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for ProblemController endpoints.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProblemControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private ProblemRepository problemRepository;

    private User setter;
    private User admin;
    private Role setterRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        problemRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
        setterRole = roleRepository.save(new Role(null, "PROBLEM_SETTER"));
        adminRole = roleRepository.save(new Role(null, "ADMIN"));
        setter = new User("setter-uid", "setter@example.com", "Setter", true, new HashSet<>(Set.of(setterRole)));
        admin = new User("admin-uid", "admin@example.com", "Admin", true, new HashSet<>(Set.of(adminRole)));
        userRepository.save(setter);
        userRepository.save(admin);
    }

    @Test
    @WithMockUser(username = "setter-uid", roles = {"PROBLEM_SETTER"})
    void createProblem_asSetter_success() throws Exception {
        ProblemCreateDTO dto = new ProblemCreateDTO();
        dto.setTitle("Test Problem");
        dto.setDescription("A + B");
        dto.setDifficulty("EASY");
        dto.setTimeLimitMillis(2000);
        dto.setMemoryLimitMB(256);
        dto.setTags(Set.of("math"));
        dto.setIsPublic(true);
        mockMvc.perform(post("/api/problems")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Problem"));
    }

    @Test
    @WithMockUser(username = "admin-uid", roles = {"ADMIN"})
    void createProblem_asAdmin_success() throws Exception {
        ProblemCreateDTO dto = new ProblemCreateDTO();
        dto.setTitle("Admin Problem");
        dto.setDescription("X + Y");
        dto.setDifficulty("MEDIUM");
        dto.setTimeLimitMillis(3000);
        dto.setMemoryLimitMB(512);
        dto.setTags(Set.of("dp"));
        dto.setIsPublic(false);
        mockMvc.perform(post("/api/problems")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Admin Problem"));
    }

    @Test
    @WithMockUser(username = "setter-uid", roles = {"PROBLEM_SETTER"})
    void updateProblem_asSetter_success() throws Exception {
        // Create problem
        ProblemCreateDTO createDTO = new ProblemCreateDTO();
        createDTO.setTitle("Update Me");
        createDTO.setDescription("Old");
        createDTO.setDifficulty("EASY");
        createDTO.setTimeLimitMillis(2000);
        createDTO.setMemoryLimitMB(256);
        createDTO.setTags(Set.of("old"));
        createDTO.setIsPublic(false);
        String createResp = mockMvc.perform(post("/api/problems")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andReturn().getResponse().getContentAsString();
        Long id = com.jayway.jsonpath.JsonPath.read(createResp, "$.data.id");
        // Update
        ProblemUpdateDTO updateDTO = new ProblemUpdateDTO();
        updateDTO.setTitle("Updated");
        updateDTO.setDescription("New");
        updateDTO.setDifficulty("HARD");
        updateDTO.setTimeLimitMillis(4000);
        updateDTO.setMemoryLimitMB(1024);
        updateDTO.setTags(Set.of("new"));
        updateDTO.setIsPublic(true);
        mockMvc.perform(put("/api/problems/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Updated"));
    }

    @Test
    @WithMockUser(username = "setter-uid", roles = {"PROBLEM_SETTER"})
    void deleteProblem_asSetter_success() throws Exception {
        // Create problem
        ProblemCreateDTO createDTO = new ProblemCreateDTO();
        createDTO.setTitle("Delete Me");
        createDTO.setDescription("To be deleted");
        createDTO.setDifficulty("EASY");
        createDTO.setTimeLimitMillis(2000);
        createDTO.setMemoryLimitMB(256);
        createDTO.setTags(Set.of("delete"));
        createDTO.setIsPublic(false);
        String createResp = mockMvc.perform(post("/api/problems")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andReturn().getResponse().getContentAsString();
        Long id = com.jayway.jsonpath.JsonPath.read(createResp, "$.data.id");
        // Delete
        mockMvc.perform(delete("/api/problems/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "setter-uid", roles = {"PROBLEM_SETTER"})
    void getProblem_asSetter_success() throws Exception {
        // Create problem
        ProblemCreateDTO createDTO = new ProblemCreateDTO();
        createDTO.setTitle("Get Me");
        createDTO.setDescription("To be fetched");
        createDTO.setDifficulty("EASY");
        createDTO.setTimeLimitMillis(2000);
        createDTO.setMemoryLimitMB(256);
        createDTO.setTags(Set.of("get"));
        createDTO.setIsPublic(true);
        String createResp = mockMvc.perform(post("/api/problems")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andReturn().getResponse().getContentAsString();
        Long id = com.jayway.jsonpath.JsonPath.read(createResp, "$.data.id");
        // Get
        mockMvc.perform(get("/api/problems/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Get Me"));
    }

    @Test
    @WithMockUser(username = "setter-uid", roles = {"PROBLEM_SETTER"})
    void listProblems_asSetter_success() throws Exception {
        // Create two problems
        for (int i = 1; i <= 2; i++) {
            ProblemCreateDTO dto = new ProblemCreateDTO();
            dto.setTitle("Problem " + i);
            dto.setDescription("Desc " + i);
            dto.setDifficulty("EASY");
            dto.setTimeLimitMillis(2000);
            dto.setMemoryLimitMB(256);
            dto.setTags(Set.of("tag" + i));
            dto.setIsPublic(true);
            mockMvc.perform(post("/api/problems")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk());
        }
        // List
        mockMvc.perform(get("/api/problems"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
} 