package com.hmis.profile.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @SuppressWarnings("null")
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        /*http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/**").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();*/
        http.csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/static/avatars/**").permitAll()
                .requestMatchers(request -> "SECRET".equals(request.getHeader("X-Secret-Key")))   
                .permitAll()
                .anyRequest().denyAll()
            );
        return http.build();
    }

}
