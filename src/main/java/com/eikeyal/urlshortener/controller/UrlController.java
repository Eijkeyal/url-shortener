package com.eikeyal.urlshortener.controller;


import com.eikeyal.urlshortener.dto.UrlRequest;
import com.eikeyal.urlshortener.dto.UrlResponse;
import com.eikeyal.urlshortener.entity.Url;
import com.eikeyal.urlshortener.service.UrlService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class UrlController {


    private final UrlService urlService;


    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }


    @PostMapping("/shorten")
    public UrlResponse shortenUrl(
            @RequestBody UrlRequest request
    ) {

        Url url =
                urlService.createShortUrl(request.getUrl());


        return new UrlResponse(
                "http://localhost:8080/"
                        + url.getShortCode()
        );

    }


    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(
            @PathVariable String shortCode
    ) {


        Url url =
                urlService.getOriginalUrl(shortCode);


        return ResponseEntity
                .status(HttpStatus.FOUND)
                .header(
                        "Location",
                        url.getOriginalUrl()
                )
                .build();

    }
    @GetMapping("/urls")
    public List<Url> getUrls(){

        return urlService.getAllUrls();

    }
    @GetMapping("/stats/{shortCode}")
    public Url getStats(
            @PathVariable String shortCode
    ){

        return urlService.getOriginalUrl(shortCode);

    }
    @GetMapping("/count")
    public long getTotalLinks(){

        return urlService.getTotalLinks();

    }
}