import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  PaginationMetaDto,
  ResponseEnvelopeDto,
} from '../dto/response-envelope.dto';

export const ApiData = <TModel extends Type<unknown>>(
  model: TModel,
  status = 200,
) =>
  applyDecorators(
    ApiExtraModels(ResponseEnvelopeDto, model),
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseEnvelopeDto) },
          { properties: { data: { $ref: getSchemaPath(model) } } },
        ],
      },
    }),
  );

export const ApiPaginated = <TModel extends Type<unknown>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(ResponseEnvelopeDto, PaginationMetaDto, model),
    ApiResponse({
      status: 200,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseEnvelopeDto) },
          {
            properties: {
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                  meta: { $ref: getSchemaPath(PaginationMetaDto) },
                },
              },
            },
          },
        ],
      },
    }),
  );
