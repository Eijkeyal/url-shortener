package com.eikeyal.urlshortener.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;


@Entity
@Data
@Table(name = "urls")
public class Url implements Serializable {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, length = 1000)
    private String originalUrl;


    @Column(nullable = false, unique = true)
    private String shortCode;


    @Column(nullable = false)
    private Long clicks = 0L;


    private LocalDateTime createdAt;

}