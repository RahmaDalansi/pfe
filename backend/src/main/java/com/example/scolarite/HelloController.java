package com.example.scolarite;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class HelloController {

        @GetMapping("/public")
        public String publicEndpoint() {
            return "This is a public endpoint, no auth required.";
        }

        @GetMapping("/private")
        public String privateEndpoint() {
            return "This is a private endpoint, requires authentication!";
        }
}
