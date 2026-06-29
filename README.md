# URL Shortener

A full-stack URL shortening application that converts long URLs into short, shareable links. Built with Spring Boot, React, and MySQL with a production deployment setup.

## Overview

This project allows users to generate short URLs from long URLs and redirect users to the original destination through the generated short link.

The project demonstrates full-stack development, REST API design, database integration, and cloud deployment.

## Features

- Convert long URLs into short URLs
- Redirect short URLs to original URLs
- REST API based backend
- Persistent URL storage using MySQL
- Frontend and backend separated architecture
- Production deployment using cloud platforms

## Tech Stack

### Frontend
- React.js
- JavaScript
- HTML
- CSS

### Backend
- Java
- Spring Boot
- Spring Data JPA
- REST API

### Database
- MySQL

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: Railway MySQL

## Architecture

```
React Frontend (Vercel)
          |
          |
     REST API
          |
          |
Spring Boot Backend (Render)
          |
          |
      MySQL Database
        (Railway)
```

## API Endpoints

### Create Short URL

```
POST /api/shorten
```

Request:

```json
{
  "url": "https://example.com"
}
```

Response:

```json
{
  "shortUrl": "abc123"
}
```

### Redirect

```
GET /{shortCode}
```

Redirects the user to the original URL.

## Local Setup

### Clone Repository

```bash
git clone https://github.com/Eijkeyal/url-shortener.git

cd url-shortener
```

## Backend Setup

Navigate to backend:

```bash
cd backend
```

Configure MySQL in:

```
application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/url_shortener

spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
```

Run Spring Boot:

```bash
./mvnw spring-boot:run
```

Backend runs on:

```
http://localhost:8080
```

## Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

## Environment Variables

Production uses environment variables for database configuration:

```
MYSQL_URL
MYSQLUSER
MYSQLPASSWORD
```

## Deployment

The application is deployed using:

- Vercel for React frontend
- Render for Spring Boot backend
- Railway for MySQL database

Production flow:

```
User
 |
React Application
 |
Spring Boot REST API
 |
MySQL Database
```

## Project Structure

```
url-shortener

├── frontend
│   ├── src
│   └── package.json
│
└── backend
    ├── controller
    ├── service
    ├── repository
    ├── entity
    └── application.properties
```

## Future Improvements

- User authentication
- URL expiration
- Click analytics
- QR code generation
- Custom short links

## Author

Eijkeyal Pakhrin

GitHub:
https://github.com/Eijkeyal
