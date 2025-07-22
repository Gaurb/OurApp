FROM eclipse-temurin:22-jre-alpine

LABEL authors="Gaurav"
LABEL maintainer="Gaurav"

WORKDIR /app

COPY target/chat-app-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# JVM tuning flags
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]