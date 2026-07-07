package org.kariya;

import org.jasypt.encryption.StringEncryptor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;


@SpringBootTest
public class JasyptTest {

    @Autowired
    private StringEncryptor stringEncryptor;

    @Test
    public void generateEncryptedData() {

        String plainText = ""; // 你要加密的明文
        String encryptedText = stringEncryptor.encrypt(plainText);
        System.out.println("加密后的密文: ENC(" + encryptedText + ")");


    }
}