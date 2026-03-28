package com.example.scolarite.service;

import com.example.scolarite.dto.ImportResponseDto;
import com.example.scolarite.dto.UserImportDto;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class CsvImportService {

    private final KeycloakUserService keycloakUserService;

    public CsvImportService(KeycloakUserService keycloakUserService) {
        this.keycloakUserService = keycloakUserService;
    }

    /**
     * Import users from CSV file with flexible column mapping
     */
    public ImportResponseDto importUsersFromCsv(MultipartFile file) {
        ImportResponseDto response = new ImportResponseDto();
        List<UserImportDto> usersToImport = new ArrayList<>();

        // Parse CSV file
        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreHeaderCase()
                     .withTrim())) {

            // Get the actual headers from the CSV
            Map<String, Integer> headerMap = csvParser.getHeaderMap();
            System.out.println("CSV Headers found: " + headerMap.keySet());

            // Map to store which field uses which header
            Map<String, String> fieldMapping = detectFieldMapping(headerMap.keySet());

            for (CSVRecord record : csvParser) {
                try {
                    UserImportDto userDto = new UserImportDto();

                    // Map using detected field mapping
                    userDto.setUsername(getFieldValue(record, fieldMapping, "username",
                            generateUsername(record, fieldMapping)));
                    userDto.setEmail(getFieldValue(record, fieldMapping, "email", null));
                    userDto.setFirstName(getFieldValue(record, fieldMapping, "firstName", null));
                    userDto.setLastName(getFieldValue(record, fieldMapping, "lastName", null));

                    // Récupérer le CIN (obligatoire)
                    String cin = getFieldValue(record, fieldMapping, "cin", null);
                    if (cin == null || cin.trim().isEmpty()) {
                        throw new IllegalArgumentException("Le numéro de carte d'identité (CIN) est obligatoire à la ligne " + record.getRecordNumber());
                    }
                    userDto.setCin(cin.trim());

                    userDto.setRole(getFieldValue(record, fieldMapping, "role", "STUDENT"));

                    usersToImport.add(userDto);
                } catch (Exception e) {
                    response.addError("Error parsing record " + record.getRecordNumber() + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            response.addError("Failed to parse CSV file: " + e.getMessage());
            return response;
        }

        response.setTotalProcessed(usersToImport.size());

        // Create each user in Keycloak avec le CIN comme mot de passe temporaire
        for (UserImportDto userDto : usersToImport) {
            // Utiliser le CIN comme mot de passe temporaire
            String temporaryPassword = userDto.getCin();
            String error = keycloakUserService.createUser(userDto, temporaryPassword);

            if (error == null) {
                response.addSuccess(userDto.getUsername());
            } else {
                response.addError(error);
            }
        }

        return response;
    }

    /**
     * Detect which CSV headers map to which fields
     */
    private Map<String, String> detectFieldMapping(java.util.Set<String> headers) {
        Map<String, String> mapping = new HashMap<>();

        // Common header variations
        Map<String, List<String>> possibleHeaders = new HashMap<>();
        possibleHeaders.put("username", List.of("username", "user", "login", "identifiant"));
        possibleHeaders.put("email", List.of("email", "e-mail", "mail", "courriel"));
        possibleHeaders.put("firstName", List.of("firstname", "first_name", "first name", "firstName", "prenom", "prénom"));
        possibleHeaders.put("lastName", List.of("lastname", "last_name", "last name", "lastName", "nom", "name"));
        possibleHeaders.put("cin", List.of("cin", "carte identite", "carte d'identite", "identite", "id card", "national id", "num carte", "numero carte"));
        possibleHeaders.put("role", List.of("role", "roles", "type", "user_type", "profile"));

        // Find matching headers
        for (String header : headers) {
            String lowerHeader = header.toLowerCase().trim();

            for (Map.Entry<String, List<String>> entry : possibleHeaders.entrySet()) {
                if (entry.getValue().stream().anyMatch(lowerHeader::contains)) {
                    mapping.put(entry.getKey(), header);
                    break;
                }
            }
        }

        System.out.println("Detected field mapping: " + mapping);
        return mapping;
    }

    /**
     * Get field value from CSV record with fallback
     */
    private String getFieldValue(CSVRecord record, Map<String, String> mapping,
                                 String fieldName, String defaultValue) {
        String header = mapping.get(fieldName);
        if (header != null && record.isMapped(header)) {
            String value = record.get(header);
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return defaultValue;
    }

    /**
     * Generate username from first and last name if username not provided
     */
    private String generateUsername(CSVRecord record, Map<String, String> mapping) {
        String firstName = getFieldValue(record, mapping, "firstName", "");
        String lastName = getFieldValue(record, mapping, "lastName", "");
        String email = getFieldValue(record, mapping, "email", "");

        if (!email.isEmpty()) {
            return email.split("@")[0]; // Use part before @ in email
        }

        if (!firstName.isEmpty() && !lastName.isEmpty()) {
            return (firstName + "." + lastName).toLowerCase().replace(" ", "");
        }

        if (!firstName.isEmpty()) {
            return firstName.toLowerCase();
        }

        // Last resort: generate random username
        return "user" + System.currentTimeMillis();
    }
}