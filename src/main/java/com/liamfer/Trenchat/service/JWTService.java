package com.liamfer.Trenchat.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class JWTService {
    @Value("${spring.jwt.secret}")
    private String secret;

    public String generateToken(String subject){
        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.create()
                .withIssuer("trenchat")
                .withSubject(subject)
                .withIssuedAt(Instant.now())
                .withExpiresAt(getDefaultExpirationTime())
                .sign(algorithm);
    }

    public String validateToken(String token){
        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.require(algorithm).withIssuer("trenchat").build().verify(token).getSubject();
    }

    private Instant getDefaultExpirationTime(){
        return Instant.now().plus(Duration.ofHours(1));
    }
}
