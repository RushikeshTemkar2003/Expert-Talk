@echo off
echo Starting ExpertTalk Spring Boot Backend...
echo.
echo Setting JAVA_HOME...
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
echo JAVA_HOME set to: %JAVA_HOME%
echo.
echo Make sure MySQL is running on localhost:3306
echo.
mvnw.cmd spring-boot:run -e
pause