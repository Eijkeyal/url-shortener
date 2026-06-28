package com.eikeyal.urlshortener.controller;


import com.eikeyal.urlshortener.entity.Url;
import com.eikeyal.urlshortener.service.UrlService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class RedirectController {


    private final UrlService urlService;


    public RedirectController(UrlService urlService) {
        this.urlService = urlService;
    }



    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(
            @PathVariable String shortCode
    ) {


        Url url = urlService.getOriginalUrl(shortCode);


        return ResponseEntity
                .status(HttpStatus.FOUND)
                .header(
                        "Location",
                        url.getOriginalUrl()
                )
                .build();

    }

}