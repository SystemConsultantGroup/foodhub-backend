import { Request } from "express";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";
import axios from "axios";

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy, "oauth2") {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    super();
  }

  async validate(req: Request) {
    const token = req.cookies["token"];

    if (!token) {
      throw new UnauthorizedException("No access token found in cookie!");
    }
    // verify signature about token

    // 1. Get KakaoPublic Keys
    let cachedKakaoPublicKeys = await this.cacheManager.get("kakaoPublicKeys");

    if (!cachedKakaoPublicKeys) {
      try {
        const response = await axios.get("https://kauth.kakao.com/.well-known/jwks.json");
        cachedKakaoPublicKeys = response.data;
        await this.cacheManager.set("kakaoPublicKeys", cachedKakaoPublicKeys, 86400);
      } catch (error) {
        throw new Error("Error fetching or caching public keys.");
      }
    }
    // 2. Public Key to Pem to use verify signature
    const kakaoPublicKeys = cachedKakaoPublicKeys["keys"];
    const decodedToken = jwt.decode(token, { complete: true });
    const tokenkKid = decodedToken.header.kid;
    const matchingPublicKey = kakaoPublicKeys.find((jwk) => jwk.kid === tokenkKid);

    if (!matchingPublicKey) {
      throw new UnauthorizedException("Invalid access token");
    }
    const pemPublicKey = jwkToPem(matchingPublicKey);

    // 2. Verify with Public Keys
    try {
      jwt.verify(token, pemPublicKey, {
        algorithms: ["RS256"],
      });
      const oauth2Id = decodedToken.payload.sub;
      return oauth2Id;
    } catch (error) {
      throw new UnauthorizedException("Invalid access token");
    }
  }
}
