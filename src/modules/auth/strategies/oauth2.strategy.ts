import { PrismaService } from "./../../../config/database/prisma.service";
import { Request } from "express";
import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";
import axios from "axios";
import { BadRequestException } from "../../../common/exceptions/bad-request-exception";

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy, "oauth2") {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prismaService: PrismaService
  ) {
    super();
  }

  async validate(req: Request) {
    const token = req.cookies["token"];

    if (!token) {
      throw new BadRequestException("AU002");
    }

    const oauthId = await this.verifyToken(token);

    if (typeof oauthId === "string") {
      const user = await this.prismaService.user.findUnique({
        where: {
          oauthId: oauthId,
        },
      });
      return user || { oauthId: oauthId };
    } else {
      throw new BadRequestException("AU004");
    }
  }

  private async verifyToken(token: string) {
    const decodedToken = jwt.decode(token, { complete: true });

    // 1. Check is Expired
    try {
      const currentTimestamp: number = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
      if (decodedToken.payload["exp"] < currentTimestamp) throw new BadRequestException("AU003");
    } catch (error) {
      throw new BadRequestException("AU003");
    }

    // 2. Verify ISS
    try {
      if (decodedToken.payload["iss"] !== "https://kauth.kakao.com") {
        throw new BadRequestException("AU004");
      }
    } catch (error) {
      throw new BadRequestException("AU004");
    }

    // 3. Verify Signature with Public Keys
    let cachedKakaoPublicKeys = await this.cacheManager.get("kakaoPublicKeys");

    if (!cachedKakaoPublicKeys) {
      try {
        const response = await axios.get("https://kauth.kakao.com/.well-known/jwks.json");
        cachedKakaoPublicKeys = response.data;
        await this.cacheManager.set("kakaoPublicKeys", cachedKakaoPublicKeys, 86400);
      } catch (error) {
        throw new BadRequestException("AU004");
      }
    }
    const kakaoPublicKeys = cachedKakaoPublicKeys["keys"];
    const tokenkKid = decodedToken.header.kid;
    const matchingPublicKey = kakaoPublicKeys.find((jwk) => jwk.kid === tokenkKid);

    if (!matchingPublicKey) {
      throw new BadRequestException("AU004");
    }
    const pemPublicKey = jwkToPem(matchingPublicKey);

    try {
      jwt.verify(token, pemPublicKey, {
        algorithms: ["RS256"],
      });
      return decodedToken.payload.sub;
    } catch (error) {
      throw new BadRequestException("AU004");
    }
  }
}
