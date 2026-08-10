
import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod/v4";
import { ValidationFailed } from "../errors/errors-class.error";

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) { }
    transform(value: unknown, metadata: ArgumentMetadata) {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (error) {
            throw new ValidationFailed();
        }
    }
}
