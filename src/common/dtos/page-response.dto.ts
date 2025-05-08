import { ApiProperty } from "@nestjs/swagger";

export class PageResponseDto<T> {
  @ApiProperty({ description: "페이지 번호" })
  pageNumber: number;
  @ApiProperty({ description: "페이지 크기" })
  pageSize: number;
  @ApiProperty({ description: "콘텐츠 총 개수" })
  totalCount: number;
  @ApiProperty({ description: "전체 페이지 수" })
  totalPages: number;
  @ApiProperty({ description: "콘텐츠" })
  content: T[];

  constructor(pageNumber: number, pageSize: number, totalCount: number, content: T[]) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.totalPages = Math.ceil(totalCount / pageSize);
    this.content = content;
  }
}
