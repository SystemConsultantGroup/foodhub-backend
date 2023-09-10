import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "src/config/database/prisma.service";

@Injectable()
export class VotesService {
  constructor(private readonly prismaService: PrismaService) {}
}
