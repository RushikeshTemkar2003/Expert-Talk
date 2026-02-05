package com.experttalk.model;

public enum UserType {
    USER(1),
    EXPERT(2),
    ADMIN(3);

    private final int value;

    UserType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static UserType fromValue(int value) {
        for (UserType type : UserType.values()) {
            if (type.getValue() == value) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid UserType value: " + value);
    }
}