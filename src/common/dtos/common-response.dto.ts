export class CommonResponseDto<T = void> {
  message: string;
  success: boolean;

  constructor(object: T, success = true, message = "success") {
    this.message = message;
    this.success = success;
    object && Object.assign(this, object);
  }
}
