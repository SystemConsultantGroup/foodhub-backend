import { IsBoolean, IsOptional, IsString } from "class-validator";

export class KakaoLoginAuthOutputDto<T = void> {
    @IsBoolean()
    success : boolean;

    @IsString()
    @IsOptional()
    message? : string;

    @IsString()
    @IsOptional()
    accessToken?: string;    

    constructor(object?: T, accessToken = null, message = "success") {
        this.accessToken = accessToken;
        this.message = message;
        object && Object.assign(this, object);
      }
}