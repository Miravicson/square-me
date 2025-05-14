import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export class PaginationMeta {
  totalItems: number;
  itemCount: number;
  totalPages: number;
  lastPage: number;
  currentPage: number;
  itemsPerPage: number;
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel
) => {
  return applyDecorators(
    ApiExtraModels(model, PaginationMeta),
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        type: 'object',
        required: ['items', 'meta'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
            nullable: false,
          },
          meta: {
            $ref: getSchemaPath(PaginationMeta),
            nullable: false,
          },
        },
      },
    })
  );
};
