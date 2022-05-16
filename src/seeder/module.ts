import { DataSource, DataSourceOptions } from "@bouncecode/typeorm";
import { loadScriptFile, loadScriptFileExport } from "locter";
import { SeederConstructor, SeederOptions } from "./type";
import {
    resolveFilePaths,
    resolveFilePatterns,
    setDefaultSeederOptions,
} from "./utils";
import {
    modifyDataSourceOptionForRuntimeEnvironment,
    setDataSource,
} from "../data-source";
import { SeederFactoryConfig, useSeederFactoryManager } from "./factory";

async function prepareSeeder(
    options?: SeederOptions
): Promise<SeederConstructor[]> {
    options = options ?? {};

    options = setDefaultSeederOptions(options);
    options = modifyDataSourceOptionForRuntimeEnvironment(options, "seeds");
    options = modifyDataSourceOptionForRuntimeEnvironment(options, "factories");

    if (options.factories) {
        let factoryFiles: string[] = [];
        const factoryConfigs: SeederFactoryConfig[] = [];

        for (let i = 0; i < options.factories.length; i++) {
            const value = options.factories[i];
            if (typeof value === "string") {
                factoryFiles.push(value);
            } else {
                factoryConfigs.push(value);
            }
        }

        if (factoryFiles.length > 0) {
            factoryFiles = resolveFilePatterns(factoryFiles);
            factoryFiles = resolveFilePaths(factoryFiles);

            for (let i = 0; i < factoryFiles.length; i++) {
                await loadScriptFile(factoryFiles[i]);
            }
        }

        if (factoryConfigs.length > 0) {
            const factoryManager = useSeederFactoryManager();

            for (let i = 0; i < factoryConfigs.length; i++) {
                factoryManager.set(
                    factoryConfigs[i].entity,
                    factoryConfigs[i].factoryFn
                );
            }
        }
    }

    const items: SeederConstructor[] = [];

    if (options.seeds) {
        let seedFiles: string[] = [];
        const seedConstructors: SeederConstructor[] = [];

        for (let i = 0; i < options.seeds.length; i++) {
            const value = options.seeds[i];
            if (typeof value === "string") {
                seedFiles.push(value);
            } else {
                seedConstructors.push(value);
            }
        }

        if (seedFiles.length > 0) {
            seedFiles = resolveFilePatterns(seedFiles);
            seedFiles = resolveFilePaths(seedFiles);

            for (let i = 0; i < seedFiles.length; i++) {
                const fileExport = await loadScriptFileExport(seedFiles[i]);
                const item = fileExport.value as SeederConstructor;

                if (!options.seedName || options.seedName === item.name) {
                    items.push(item);
                }
            }
        }

        if (seedConstructors.length > 0) {
            for (let i = 0; i < seedConstructors.length; i++) {
                if (
                    !options.seedName ||
                    options.seedName === seedConstructors[i].name
                ) {
                    items.push(seedConstructors[i]);
                }
            }
        }
    }

    return items;
}

export async function runSeeder(
    dataSource: DataSource,
    seeder: SeederConstructor,
    options?: SeederOptions
): Promise<void> {
    options = options || {};
    options.seeds = [seeder];
    options.factoriesLoad = options.factoriesLoad ?? true;

    if (options.factoriesLoad && !options.factories) {
        const { factories: dataSourceFactories } =
            dataSource.options as DataSourceOptions & SeederOptions;

        if (typeof dataSourceFactories !== "undefined") {
            options.factories = dataSourceFactories;
        }
    }

    await prepareSeeder(options);

    setDataSource(dataSource);

    // eslint-disable-next-line new-cap
    const clazz = new seeder();

    const factoryManager = useSeederFactoryManager();
    await clazz.run(dataSource, factoryManager);
}

export async function runSeeders(
    dataSource: DataSource,
    options?: SeederOptions
): Promise<void> {
    options = options || {};

    const { seeds, factories } = dataSource.options as DataSourceOptions &
        SeederOptions;

    if (typeof options.seeds === "undefined" && typeof seeds !== "undefined") {
        options.seeds = seeds;
    }

    if (
        typeof options.factories === "undefined" &&
        typeof factories !== "undefined"
    ) {
        options.factories = factories;
    }

    const items = await prepareSeeder(options);

    for (let i = 0; i < items.length; i++) {
        await runSeeder(dataSource, items[i], {
            factoriesLoad: false,
        });
    }
}
