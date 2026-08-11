# My Debugging

#### Error: `[Nest] 58132 - 08/09/2026, 2:50:04 AM ERROR [ExceptionsHandler] Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`

- Fix: Add "ConfigModule.forRoot({isGlobal: true})" in appModule.
- Explanation: Service was unable to read .env as access was not made global to entire application, though the package "@nestjs/config" was installed.

---
#### Error: `Namespace 'global.Express' has no exported member 'Multer'.ts(2694)`

- Fix: Add 'Multer' in compilerOptions type.
- Explanation: In our tsconfig.json file, possibly there's a "types" property specified under compilerOptions, which, according to this typescript definition, if types is specified, only packages listed will be included in the global scope, therefore, if "Multer" was not included there, it won't automatically be included in the global scope, and this is why we're getting an error.