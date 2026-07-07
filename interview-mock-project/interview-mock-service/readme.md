## 本地 Jasypt 加密配置

项目中的数据库密码等敏感配置建议使用 Jasypt 加密后提交，例如：

```yaml
spring:
  datasource:
    password: ENC(your-encrypted-password)