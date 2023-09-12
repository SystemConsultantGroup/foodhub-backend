import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { winstonLogger } from "./config/logger/winston/logger";
import { PrismaService } from "./config/database/prisma.service";
import * as cookieParser from "cookie-parser";

import { Migration } from "./config/migration";
import * as jwt from "jsonwebtoken";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  const appConfig = app.get(ConfigService);

  // Swagger Setting
  const config = new DocumentBuilder()
    .setTitle("Foodhub Backend")
    .setDescription("API description")
    .setVersion("1.0")
    .addTag("temp")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  app.use(cookieParser());
  const prismaService = app.get(PrismaService);

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  const migration = new Migration();
  // const token = "eyJraWQiOiI5ZjI1MmRhZGQ1ZjIzM2Y5M2QyZmE1MjhkMTJmZWEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4NTBjZjNmMjAxNTI2YmZhNGM3MWE4ZmJhODI1ODU4NyIsInN1YiI6IjMwMDAyMTEyNDciLCJhdXRoX3RpbWUiOjE2OTQ0MDYxNDQsImlzcyI6Imh0dHBzOi8va2F1dGgua2FrYW8uY29tIiwibmlja25hbWUiOiLqtozshJ3tmIQiLCJleHAiOjE2OTQ0Mjc3NDQsImlhdCI6MTY5NDQwNjE0NCwicGljdHVyZSI6Imh0dHA6Ly9rLmtha2FvY2RuLm5ldC9kbi9zMHZKMS9idHNyTmtLSTF5cC9tWWZHZ2R5eVJIcVAwMjVrWEk5SElLL2ltZ18xMTB4MTEwLmpwZyJ9.MZngtVtfZCyvnHYjBDRtAHIhSWh_pW-I0j5H3JupW0WNsuye6FNB3aYmSq40Ua00SpcwWjyox32jTM1E50FUSBBLxbreEJ4Y5BoaIWoraPDgTLvj1t-RFk-UntH0EAVSoY6qPy0z78vyvoHjoa3SRgNVPDtlOauuhS-8KSAQXqAuaLZPxfa249fEUvKuwcmbIdU91QHekERAWKvQwhcNlisEpL7CJU7xKcDEn-bFvpXQdVQBglspDAVeobSdSsKtcDnA7Xdo-t0QCdnBIk23RNDoURzc4QGjf_dyIdlgT6K1oQbiZj4ne5sU7jhY7KJfn8D1fxoNxI_bRCrYipddzQ"
  // const decodedToken = jwt.decode(token);
  // const sub = decodedToken.sub;
  // await migration.updateUser(sub);
  //await migration.createArea();

  await app.listen(appConfig.get("app.port"));
}
bootstrap();
