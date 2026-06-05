package com.library.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components().addSecuritySchemes("sessionCookie",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("LIBRARY_SESSION")
                                .description("Сесія створюється після /api/auth/login або /api/auth/verify-email")))
                .info(new Info()
                        .title("Technical Literature Library API")
                        .version("1.0")
                        .description("REST API для системи керування бібліотекою технічної літератури")
                        .contact(new Contact().name("Library Team").email("admin@library.local")));
    }
}
