package com.hmis.user.service.serviceImpl;

import com.hmis.user.dto.UserDto;
import com.hmis.user.entity.User;
import com.hmis.user.exception.HMSException;
import com.hmis.user.repository.UserRepository;
import com.hmis.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void registerUser(UserDto userDto) throws HMSException {
        Optional<User> user = userRepository.findByEmail(userDto.getEmail());
        if (user.isPresent()) {
            throw new HMSException("USER_ALREADY_EXISTS");
        }
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        userRepository.save(userDto.toEntity());
    }

    @Override
    public UserDto loginUser(UserDto userDto) throws HMSException {
        User user = userRepository.findByEmail(userDto.getEmail()).orElseThrow(() -> new HMSException("USER_NOT_FOUND"));
        if (!passwordEncoder.matches(userDto.getPassword(), user.getPassword())) {
            throw new HMSException("INVALID_CREDENTIALS");
        }
        user.setPassword(null);
        return user.toDto();
    }

    @Override
    public UserDto getUserById(Long id) throws HMSException {
        User user = userRepository.findById(id).orElseThrow(() -> new HMSException("USER_NOT_FOUND"));
        user.setPassword(null);
        return user.toDto();
    }

    @Override
    public void updateUser(UserDto userDto) {
        throw new UnsupportedOperationException("Update user not implemented yet");
    }

    @Override
    public UserDto getUserByEmail(String email) throws HMSException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new HMSException("USER_NOT_FOUND"));
        return user.toDto();
    }
}
