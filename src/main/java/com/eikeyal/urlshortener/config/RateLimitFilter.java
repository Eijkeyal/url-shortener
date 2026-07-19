package com.eikeyal.urlshortener.config;


import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;


@Component
public class RateLimitFilter implements Filter {

    private final StringRedisTemplate redisTemplate;

    public RateLimitFilter(StringRedisTemplate redisTemplate) {

        this.redisTemplate = redisTemplate;

    }

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest httpRequest =
                (HttpServletRequest) request;

        HttpServletResponse httpResponse =
                (HttpServletResponse) response;
        String path =
                httpRequest.getRequestURI();



        // Only protect shorten API

        if(path.equals("/api/shorten")) {


            String ip =
                    httpRequest.getRemoteAddr();

            String key =
                    "rate_limit:" + ip;

            String count =
                    redisTemplate.opsForValue()
                            .get(key);

            if(count != null && Integer.parseInt(count) >= 15) {


                httpResponse.setStatus(429);

                httpResponse.getWriter()
                        .write("Too many requests");

                return;

            }

            if(count == null) {


                redisTemplate.opsForValue()
                        .set(
                                key,
                                "1",
                                Duration.ofMinutes(1)
                        );


            } else {


                redisTemplate.opsForValue()
                        .increment(key);


            }


        }



        chain.doFilter(request,response);

    }

}