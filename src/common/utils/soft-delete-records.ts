import { InternalServerErrorException } from "@nestjs/common";

export async function softDeleteRecords(model, filter) {
  try {
    await model.updateMany({
      where: {
        ...filter,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  } catch (e) {
    console.log(e);
    throw new InternalServerErrorException("데이터 삭제를 실패했습니다.");
  }
}
