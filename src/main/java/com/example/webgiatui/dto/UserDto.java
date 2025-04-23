package com.example.webgiatui.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto extends BaseDto {
    private Long id;

    @NotBlank(message = "Tên không được để trống")
    private String name;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
    
    // Additional fields for user profile data
    private String phoneNumber;
    private String address;
    
    // Fields to help with name splitting if needed
    private String firstName;
    private String lastName;
    
    private List<String> roles;
    
    /**
     * Helper method to get first name if it's not set directly
     */
    public String getFirstName() {
        if (firstName != null) {
            return firstName;
        }
        
        if (name != null) {
            String[] names = this.name.split(" ", 2);
            return names.length > 0 ? names[0] : "";
        }
        
        return "";
    }
    
    /**
     * Helper method to get last name if it's not set directly
     */
    public String getLastName() {
        if (lastName != null) {
            return lastName;
        }
        
        if (name != null) {
            String[] names = this.name.split(" ", 2);
            return names.length > 1 ? names[1] : "";
        }
        
        return "";
    }
    
    /**
     * Helper method to set name from first and last name
     */
    public void setFirstAndLastName(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = firstName + (lastName != null && !lastName.isEmpty() ? " " + lastName : "");
    }
}
