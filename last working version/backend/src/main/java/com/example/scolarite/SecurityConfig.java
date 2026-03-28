package com.example.scolarite;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final KeycloakRoleConverter keycloakRoleConverter;

    public SecurityConfig(KeycloakRoleConverter keycloakRoleConverter) {
        this.keycloakRoleConverter = keycloakRoleConverter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // 🔵 ANCIENNE LOGIQUE PRÉSERVÉE (inchangée)
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/professor/**").hasRole("PROFESSOR")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // 🟢 NOUVELLE LOGIQUE AJOUTÉE
                        // Page d'attente pour utilisateurs en validation
                        .requestMatchers("/api/user/pending/**").hasRole("PENDING")
                        // Endpoint pour les étudiants
                        .requestMatchers("/api/etudiant/**").hasRole("STUDENT")

                        .requestMatchers("/api/profile/**").authenticated()

                        // Tout le reste nécessite une authentification
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(keycloakRoleConverter)
                        )
                );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri("http://localhost:8081/realms/scolarite/protocol/openid-connect/certs").build();
    }
}