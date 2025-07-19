FROM alpine/java:22-jdk

LABEL authors="Gaurav"

WORKDIR /app

COPY target/chat-app-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar","app.jar"]