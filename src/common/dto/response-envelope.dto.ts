import { ApiProperty } from '@nestjs/swagger';

export class ResponseEnvelopeDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '/tasks' })
  path: string;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  timestamp: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Not Found' })
  error: string;

  @ApiProperty({
    example: 'task_not_found',
    description: 'A string or an array of validation messages',
  })
  message: string | string[];

  @ApiProperty({ example: '/tasks/123' })
  path: string;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  timestamp: string;
}
