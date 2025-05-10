import {
  IsNotEmpty,
  IsNumberString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsPositiveNumberString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPositiveNumberString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          const num = parseFloat(value);
          return typeof value === 'string' && !isNaN(num) && num > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a string representing a positive number`;
        },
      },
    });
  };
}

export class DebitWalletInputDto {
  @IsNotEmpty()
  @IsNumberString()
  @IsPositiveNumberString()
  amount: string;
}
