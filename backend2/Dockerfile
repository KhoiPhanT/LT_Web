# Khởi: đóng gói Servlet thành WAR; Lợi: triển khai WAR trên Tomcat cho luồng OTP/thanh toán.
# Stage 1: Build source code bằng Maven
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q clean package

# Stage 2: Deploy ứng dụng lên Apache Tomcat 10
FROM tomcat:10.1-jdk21-temurin
WORKDIR /usr/local/tomcat
# Xóa các webapp mặc định của Tomcat
RUN rm -rf webapps/*
# Deploy war vào ROOT để có context path trực tiếp /api/v1/*
COPY --from=build /app/target/backend2.war webapps/ROOT.war
EXPOSE 8080
CMD ["catalina.sh", "run"]
