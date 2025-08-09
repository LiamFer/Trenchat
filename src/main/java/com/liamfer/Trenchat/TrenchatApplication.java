package com.liamfer.Trenchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TrenchatApplication {
	public static void main(String[] args) {
		SpringApplication.run(TrenchatApplication.class, args);
	}
}
