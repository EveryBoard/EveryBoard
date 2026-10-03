#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import ts from 'typescript';

type ExportedSymbol = {
    name: string;
    source: string;
};

type UnusedExport = ExportedSymbol & {
    moduleName: string;
};

const repositoryRoot: string = path.resolve(import.meta.dirname, '..');
const gamesRoot: string = path.join(repositoryRoot, 'games');
const entryPoints: ReadonlyMap<string, string> = new Map([
    ['@everyboard/games', path.join(gamesRoot, 'src/index.ts')],
    ['@everyboard/games/testing', path.join(gamesRoot, 'src/testing.ts')],
]);

function loadGamesProgram(): ts.Program {
    const configPath: string = path.join(gamesRoot, 'tsconfig.json');
    const config: { config?: unknown; error?: ts.Diagnostic } = ts.readConfigFile(configPath, ts.sys.readFile);
    if (config.error !== undefined) {
        throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
    }
    const parsed: ts.ParsedCommandLine = ts.parseJsonConfigFileContent(config.config, ts.sys, gamesRoot);
    return ts.createProgram(parsed.fileNames, parsed.options);
}

function exportedSymbols(program: ts.Program, entryPoint: string): ExportedSymbol[] {
    const checker: ts.TypeChecker = program.getTypeChecker();
    const sourceFile: ts.SourceFile | undefined = program.getSourceFile(entryPoint);
    const moduleSymbol: ts.Symbol | undefined = sourceFile === undefined ?
        undefined :
        checker.getSymbolAtLocation(sourceFile);
    if (sourceFile === undefined || moduleSymbol === undefined) {
        throw new Error(`Could not load games entry point ${path.relative(repositoryRoot, entryPoint)}`);
    }

    return checker.getExportsOfModule(moduleSymbol).map((symbol: ts.Symbol): ExportedSymbol => {
        const target: ts.Symbol = (symbol.flags & ts.SymbolFlags.Alias) === 0 ?
            symbol :
            checker.getAliasedSymbol(symbol);
        const declaration: ts.Declaration | undefined = target.declarations?.[0] ?? symbol.declarations?.[0];
        return {
            name: symbol.getName(),
            source: declaration === undefined ? entryPoint : declaration.getSourceFile().fileName,
        };
    });
}

function recordImports(sourceFile: ts.SourceFile, usedByModule: ReadonlyMap<string, Set<string>>): void {
    function visit(node: ts.Node): void {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier !== undefined &&
            ts.isStringLiteral(node.moduleSpecifier)) {
            const used: Set<string> | undefined = usedByModule.get(node.moduleSpecifier.text);
            const bindings: ts.NamedImportBindings | ts.NamedExportBindings | undefined =
                ts.isImportDeclaration(node) ? node.importClause?.namedBindings : node.exportClause;
            if (used !== undefined && bindings !== undefined) {
                if (ts.isNamedImports(bindings) || ts.isNamedExports(bindings)) {
                    for (const element of bindings.elements) {
                        used.add(element.propertyName?.text ?? element.name.text);
                    }
                } else {
                    throw new Error(
                        `${path.relative(repositoryRoot, sourceFile.fileName)} uses a namespace import or export from ` +
                        `${node.moduleSpecifier.text}; use named bindings so exports can be checked.`,
                    );
                }
            } else if (used !== undefined && ts.isExportDeclaration(node)) {
                throw new Error(
                    `${path.relative(repositoryRoot, sourceFile.fileName)} re-exports everything from ` +
                    `${node.moduleSpecifier.text}; use named exports so exports can be checked.`,
                );
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);
}

function findUsedExports(): ReadonlyMap<string, Set<string>> {
    const usedByModule: Map<string, Set<string>> = new Map(
        [...entryPoints.keys()].map((moduleName: string): [string, Set<string>] => [moduleName, new Set()]),
    );
    const sourceFiles: string[] = ts.sys.readDirectory(
        repositoryRoot,
        ['.ts', '.tsx'],
        ['**/node_modules/**', '**/dist/**', '**/coverage/**', 'games/src/**'],
    );
    for (const fileName of sourceFiles) {
        const contents: string = fs.readFileSync(fileName, 'utf8');
        const sourceFile: ts.SourceFile = ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, false);
        recordImports(sourceFile, usedByModule);
    }
    return usedByModule;
}

function main(): void {
    const program: ts.Program = loadGamesProgram();
    const usedByModule: ReadonlyMap<string, Set<string>> = findUsedExports();
    const unused: UnusedExport[] = [];

    for (const [moduleName, entryPoint] of entryPoints) {
        const used: Set<string> = usedByModule.get(moduleName) ?? new Set();
        for (const exported of exportedSymbols(program, entryPoint)) {
            if (!used.has(exported.name)) {
                unused.push({ moduleName, ...exported });
            }
        }
    }

    if (unused.length === 0) {
        console.log('All public exports from @everyboard/games are used.');
        return;
    }

    console.error(`Found ${unused.length} unused public export${unused.length === 1 ? '' : 's'}:`);
    for (const exported of unused) {
        console.error(
            `  ${exported.moduleName}: ${exported.name} ` +
            `(${path.relative(repositoryRoot, exported.source)})`,
        );
    }
    process.exitCode = 1;
}

main();
