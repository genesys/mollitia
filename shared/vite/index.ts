// Helpers
import { defineConfig, mergeConfig } from 'vite';
import { UserConfig, UserConfigFnObject } from 'vitest/config';
import * as path from 'node:path';
import dts from 'vite-plugin-dts';

export type LibOptions = {
    name: string;
    base: string;
    entry: string[];
    version: string;
};
export function defineLibConfig ({ name, base, entry, version }: LibOptions, userConfig?: UserConfigFnObject): UserConfigFnObject {
    const computeDefaultConfig = defineConfig(() => ({
        build: {
            emptyOutDir: false,
            lib: {
                entry: entry.map((file) => path.join(base, file)),
                formats: ['es', 'cjs', 'umd'],
                name,
                fileName (format, entryName) {
                    switch (format) {
                        case 'umd': {
                            return `${entryName}.umd.js`;
                        }
                        case 'cjs': {
                            return `${entryName}.cjs`;
                        }
                        case 'es': {
                            return `${entryName}.js`;
                        }
                    }
                }
            }
        },
        define: {
          __VERSION__: `'${version}'`
        },
        plugins: [dts({ entryRoot: base, include: [base] })],
        test: {
            passWithNoTests: true,
            setupFiles: [path.resolve(__dirname, './setup.ts')],
            coverage: {
                all: true,
                enabled: true,
                reporter: ['text', 'html'],
                include: [
                    '**/src/**'
                ]
            }
        }
    } as UserConfig));
    if (userConfig) {
        return (configEnv) => mergeConfig(computeDefaultConfig(configEnv), userConfig(configEnv));
    }
    return (configEnv) => computeDefaultConfig(configEnv);
}
