import { EntitySchema, ObjectType } from "@bouncecode/typeorm";
import { SeederFactoryManager } from "./manager";
import { FactoryCallback, SeederFactoryConfig } from "./type";

let instance: SeederFactoryManager | undefined;

export function useSeederFactoryManager() {
    if (typeof instance !== "undefined") {
        return instance;
    }

    instance = new SeederFactoryManager();

    return instance;
}

export function setSeederFactory<O extends Record<string, any>>(
    entity: ObjectType<O> | EntitySchema<O>,
    factoryFn: FactoryCallback<O>
): SeederFactoryConfig {
    const manager = useSeederFactoryManager();
    return manager.set(entity, factoryFn);
}

export function useSeederFactory<O extends Record<string, any>>(
    entity: ObjectType<O> | EntitySchema<O>
) {
    const manager = useSeederFactoryManager();
    return manager.get(entity);
}
