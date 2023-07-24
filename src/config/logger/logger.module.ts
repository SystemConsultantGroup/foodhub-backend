import { Module, Logger, Global } from "@nestjs/common";

@Global()
@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
