# My Debugging

#### Error: `[Nest] 58132 - 08/09/2026, 2:50:04 AM ERROR [ExceptionsHandler] Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`

- Fix: Add "ConfigModule.forRoot({isGlobal: true})" in appModule.
- Explanation: Service was unable to read .env as access was not made global to entire application, though the package "@nestjs/config" was installed.
