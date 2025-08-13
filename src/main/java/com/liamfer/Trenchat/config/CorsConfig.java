package com.liamfer.Trenchat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

//        config.setAllowedOrigins(List.of("http://192.168.101.69:5173")); // só essa origem
        config.addAllowedOriginPattern("*");
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS")); // métodos permitidos
        config.setAllowedHeaders(List.of("*","http://192.168.101.69:5173")); // qualquer header
        config.setAllowCredentials(true); // permite enviar cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
