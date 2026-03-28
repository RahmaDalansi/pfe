package com.example.scolarite;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class KeycloakRoleConverter extends JwtAuthenticationConverter {

    public KeycloakRoleConverter() {
        setJwtGrantedAuthoritiesConverter(new KeycloakRolesConverter());
    }

    private static class KeycloakRolesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            Set<GrantedAuthority> authorities = new HashSet<>();

            // Extraire les rôles du realm_access
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null && !realmAccess.isEmpty()) {
                Object rolesObj = realmAccess.get("roles");
                if (rolesObj instanceof Collection) {
                    @SuppressWarnings("unchecked")
                    Collection<String> roles = (Collection<String>) rolesObj;

                    if (roles != null && !roles.isEmpty()) {
                        // Ajouter les rôles avec le préfixe ROLE_
                        roles.stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                .forEach(authorities::add);
                    }
                }
            }

            // Optionnel : Ajouter aussi les rôles depuis resource_access si nécessaire
            Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
            if (resourceAccess != null) {
                // Vous pouvez ajouter une logique similaire ici si besoin
            }

            System.out.println("Authorités extraites: " + authorities);

            return authorities;
        }
    }
}