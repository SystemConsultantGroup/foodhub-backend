import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { winstonLogger } from "./config/logger/winston/logger";
import { PrismaService } from "./config/database/prisma.service";

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

  const prismaService = app.get(PrismaService);

  await app.listen(appConfig.get("app.port"));
}
bootstrap();
