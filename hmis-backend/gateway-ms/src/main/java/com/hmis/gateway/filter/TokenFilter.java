package com.hmis.gateway.filter;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class TokenFilter extends AbstractGatewayFilterFactory<TokenFilter.Config> {

    private static final String JWT_SECRET = "1c3db1843f64c1687b3b4a743ae00dd2bf7b12165a69594a1832fdcfab9f29fca6fde1c9b2e949c27fef8f217ac4b18d561bc95a257618085b834513a17475e4";

    public TokenFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().toString();
            if (path.equals("/user/login") || path.equals("/user/register")) {
                return chain.filter(exchange.mutate().request(r -> r.header("X-Secret-Key", "SECRET")).build());
            }
            HttpHeaders headers = exchange.getRequest().getHeaders();
            if (!headers.containsHeader(HttpHeaders.AUTHORIZATION)) {
                /*
                 * exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                 * return exchange.getResponse().setComplete();
                 */
                throw new RuntimeException("Authrization Header is missing");
            }
            String authHeader = headers.getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer")) {
                throw new RuntimeException("Authrization Header is invalid");
            }
            String token = authHeader.substring(7);
            try {
                SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
                exchange = exchange.mutate().request(r -> r.header("X-Secret-Key", "SECRET")).build();
            } catch (Exception e) {
                throw new RuntimeException("Token is Invalid");
            }
            return chain.filter(exchange);
        };
    }

    public static class Config {

    }

}
