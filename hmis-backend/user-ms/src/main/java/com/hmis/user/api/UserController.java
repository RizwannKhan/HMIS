package com.hmis.user.api;

import com.hmis.user.dto.ResponseDto;
import com.hmis.user.dto.UserDto;
import com.hmis.user.exception.HMSException;
import com.hmis.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@Validated
@CrossOrigin
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ResponseDto> registerUser(@RequestBody @Valid UserDto userDto) throws HMSException {
        userService.registerUser(userDto);
        return ResponseEntity.ok(new ResponseDto("User registered successfully"));
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<UserDto> loginUser(@RequestBody @Valid UserDto userDto) throws HMSException {
        return ResponseEntity.ok(userService.loginUser(userDto));
    }
}
