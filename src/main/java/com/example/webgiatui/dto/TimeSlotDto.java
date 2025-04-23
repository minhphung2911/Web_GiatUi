package com.example.webgiatui.dto;

import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
} 