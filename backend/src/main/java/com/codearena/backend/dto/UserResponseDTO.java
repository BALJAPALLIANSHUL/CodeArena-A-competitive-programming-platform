package com.codearena.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserResponseDTO {
    private String firebaseUid;
    private String email;
    private String displayName;
    private List<String> roles;
} 