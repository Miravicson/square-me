import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import Decimal from 'decimal.js';

export const DecimalToString = () => {
  return applyDecorators(
    ApiProperty({ type: String }),
    Transform(({ value }: { value: Decimal | null }) => {
      if (!value) {
        return null;
      }
      return value.toFixed(2);
    })
  );
};
