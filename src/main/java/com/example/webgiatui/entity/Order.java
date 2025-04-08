package com.example.webgiatui.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity<Long> {
    private static final long serialVersionUID = 1L;
    @Column(unique = true)
    private String orderCode;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "service_id")
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
