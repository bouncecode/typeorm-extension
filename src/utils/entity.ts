import { EntitySchema, InstanceChecker, ObjectType } from "@bouncecode/typeorm";

export function getEntityName<O>(
    entity: ObjectType<O> | EntitySchema<O>
): string {
    if (typeof entity === "function") {
        return entity.name;
    }

    if (InstanceChecker.isEntitySchema(entity)) {
        return entity.options.name;
    }

    return new (entity as any)().constructor.name;
}
