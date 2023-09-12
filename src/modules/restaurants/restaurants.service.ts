import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/config/database/prisma.service";

@Injectable()
export class RestaurantsService {
  constructor(private prismaService: PrismaService) {}
}
