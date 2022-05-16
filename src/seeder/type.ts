import { DataSource } from "@bouncecode/typeorm";
import { SeederFactoryConfig, SeederFactoryManager } from "./factory";

export interface Seeder {
    run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<void>;
}

export type SeederConstructor = new () => Seeder;

export type SeederOptions = {
    seeds?: SeederConstructor[] | string[];
    seedName?: string;

    factories?: SeederFactoryConfig[] | string[];
    factoriesLoad?: boolean;
};
