package com.hmis.user.service;

import com.hmis.user.dto.UserDto;
import com.hmis.user.exception.HMSException;

public interface UserService {

    public void registerUser(UserDto userDto) throws HMSException;
    public UserDto loginUser(UserDto userDto) throws HMSException;
    public UserDto getUserById(Long id) throws HMSException;
    public void updateUser(UserDto userDto);
    public UserDto getUserByEmail(String email) throws HMSException;

}
