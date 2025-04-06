package com.example.webgiatui.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Order extends BaseEntity<Long> {
    @Column(unique = true)
    private String orderCode;

    @ManyToOne
    private User customer;

    @ManyToOne
    private Service service;

    private Double weight;
    private LocalDate receivedDate;
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private String note;

    @Getter
    public enum OrderStatus {
        PENDING("CHỜ XỬ LÝ"),
        WASHING("ĐANG GIẶT"),
        COMPLETED("HOÀN TẤT");

        private final String name;

        OrderStatus(String name) {
            this.name = name;
        }

    }
}
