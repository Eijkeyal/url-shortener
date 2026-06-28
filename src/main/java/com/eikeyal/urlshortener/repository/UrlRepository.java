package com.eikeyal.urlshortener.repository;


import com.eikeyal.urlshortener.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface UrlRepository extends JpaRepository<Url, Long> {


    Optional<Url> findByShortCode(String shortCode);


    boolean existsByShortCode(String shortCode);


    Optional<Url> findFirstByOriginalUrl(String originalUrl);


}