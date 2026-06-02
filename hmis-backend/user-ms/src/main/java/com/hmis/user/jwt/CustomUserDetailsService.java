package com.hmis.user.jwt;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.hmis.user.dto.UserDto;
import com.hmis.user.exception.HMSException;
import com.hmis.user.service.UserService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserService userService;

    @Override
    public CustomUserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            UserDto dto = userService.getUserByEmail(email);
            return new CustomUserDetails(dto.getId(), dto.getEmail(), dto.getPassword(), dto.getRole(), dto.getName(),
                    dto.getEmail(), null);
        } catch (HMSException e) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
    }

}
