# Library Backend

Spring Boot backend for the Technical Literature Library Management System.

Quick start (local):

1. Ensure PostgreSQL is running and accessible (DB `librarydb`).
2. Configure `src/main/resources/application.yml` credentials.
3. Build and run:

```bash
mvn -f backend/pom.xml clean package
java -jar backend/target/library-backend-0.0.1-SNAPSHOT.jar
```

Swagger UI: http://localhost:8080/swagger-ui.html
