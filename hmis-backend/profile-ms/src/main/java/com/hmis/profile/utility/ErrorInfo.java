package com.hmis.profile.utility;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorInfo {

    private String errorMessage;
    private int errorCode;
    private LocalDateTime timestamp;

}
