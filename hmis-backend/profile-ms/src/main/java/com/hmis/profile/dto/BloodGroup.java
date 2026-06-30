package com.hmis.profile.dto;

import lombok.Getter;

@Getter
public enum BloodGroup {

    A_POSITIVE("A+"),
    A_NEGATIVE("A-"),
    B_POSITIVE("B+"),
    B_NEGATIVE("B-"),
    O_POSITIVE("O+"),
    O_NEGATIVE("O-"),
    AB_POSITIVE("AB+"),
    AB_NEGATIVE("AB-"),
    UNKNOWN("Unknown");

    private final String displayName;

    BloodGroup(String displayName) {
        this.displayName = displayName;
    }

    // ✅ Convert "A+" string → Enum (useful when receiving from API/frontend)
    public static BloodGroup fromString(String value) {
        for (BloodGroup bg : BloodGroup.values()) {
            if (bg.displayName.equalsIgnoreCase(value)) {
                return bg;
            }
        }
        throw new IllegalArgumentException("Invalid blood group: " + value);
    }
}