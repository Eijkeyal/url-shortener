package com.eikeyal.urlshortener.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UrlNotFoundException.class)
    public ResponseEntity<Map<String,Object>> handleUrlNotFound(
            UrlNotFoundException exception
    ) {


        Map<String,Object> response = new HashMap<>();


        response.put(
                "message",
                exception.getMessage()
        );


        response.put(
                "status",
                404
        );


        response.put(
                "timestamp",
                LocalDateTime.now()
        );


        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);

    }
}