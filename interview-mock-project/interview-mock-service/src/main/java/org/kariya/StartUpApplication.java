package org.kariya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class StartUpApplication {

    private static final String JASYPT_PASSWORD_PROPERTY = "jasypt.encryptor.password";
    private static final String JASYPT_PASSWORD_ENV = "JASYPT_ENCRYPTOR_PASSWORD";
    private static final String JASYPT_PASSWORD_FILE = ".jasypt.password";

    public static void main(String[] args) {
        loadJasyptPassword();
        SpringApplication.run(StartUpApplication.class, args);
    }

    private static void loadJasyptPassword() {
        if (System.getProperty(JASYPT_PASSWORD_PROPERTY) != null) {
            return;
        }
        String envPassword = System.getenv(JASYPT_PASSWORD_ENV);
        if (envPassword != null && !envPassword.isBlank()) {
            System.setProperty(JASYPT_PASSWORD_PROPERTY, envPassword.trim());
            return;
        }
        try (InputStream inputStream = StartUpApplication.class
                .getClassLoader()
                .getResourceAsStream(JASYPT_PASSWORD_FILE)) {
            if (inputStream == null) {
                return;
            }
            String password = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8).trim();
            if (!password.isBlank()) {
                System.setProperty(JASYPT_PASSWORD_PROPERTY, password);
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load local Jasypt password file: " + JASYPT_PASSWORD_FILE, e);
        }
    }
}
