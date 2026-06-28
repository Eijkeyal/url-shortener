package com.eikeyal.urlshortener.service;


import com.eikeyal.urlshortener.entity.Url;
import com.eikeyal.urlshortener.exception.UrlNotFoundException;
import com.eikeyal.urlshortener.repository.UrlRepository;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;


@Service
public class UrlService {


    private final UrlRepository urlRepository;


    public UrlService(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    public Url createShortUrl(String originalUrl) {


        Optional<Url> existingUrl =
                urlRepository.findFirstByOriginalUrl(originalUrl);


        if(existingUrl.isPresent()) {

            return existingUrl.get();

        }


        String shortCode;


        do {

            shortCode = generateCode();

        } while(urlRepository.existsByShortCode(shortCode));


        Url url = new Url();


        url.setOriginalUrl(originalUrl);

        url.setShortCode(shortCode);

        url.setCreatedAt(LocalDateTime.now());


        return urlRepository.save(url);

    }

    private String generateCode() {


        String characters =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


        StringBuilder code = new StringBuilder();


        Random random = new Random();


        for(int i = 0; i < 6; i++) {


            int index =
                    random.nextInt(characters.length());


            code.append(
                    characters.charAt(index)
            );

        }


        return code.toString();

    }



    @Cacheable(value = "urls", key = "#shortCode")
    public Url getOriginalUrl(String shortCode) {


        Url url =
                urlRepository
                        .findByShortCode(shortCode)
                        .orElseThrow(
                                () -> new UrlNotFoundException("URL not found")
                        );


        url.setClicks(
                url.getClicks() + 1
        );


        return urlRepository.save(url);

    }





    private boolean isValidUrl(String url) {


        if(url == null || url.isBlank()) {

            return false;

        }


        try {

            new java.net.URL(url).toURI();

            return true;


        } catch (Exception e) {

            return false;

        }

    }
    public List<Url> getAllUrls(){

        return urlRepository.findAll();

    }
    public Url getStats(String shortCode){

        return urlRepository.findByShortCode(shortCode)
                .orElseThrow();

    }
    public long getTotalLinks(){

        return urlRepository.count();

    }
}