import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export function IsAfterDate(
  relatedPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isAfterDate",
      target: object.constructor,
      propertyName,
      constraints: [relatedPropertyName],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedName] = args.constraints as [string];
          const relatedValue = (args.object as any)?.[relatedName] as unknown;

          if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
            // Se o pipe/transform não converteu, deixa outras validações cuidarem.
            return true;
          }

          return value.getTime() > relatedValue.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedName] = args.constraints as [string];
          return `${args.property} must be greater than ${relatedName}`;
        },
      },
    });
  };
}
