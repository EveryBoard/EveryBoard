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
const gamesSourceRoot: string = path.join(gamesRoot, 'src/games');
const publicRoot: string = path.join(gamesRoot, 'src/public');

function findEntryPoints(): ReadonlyMap<string, string> {
    const entryPoints: Map<string, string> = new Map([
        ['@everyboard/games', path.join(gamesRoot, 'src/index.ts')],
        ['@everyboard/games/testing', path.join(gamesRoot, 'src/testing.ts')],
    ]);
    const gameEntryPoints: string[] = ts.sys.readDirectory(publicRoot, ['.ts']);
    for (const entryPoint of gameEntryPoints) {
        const relativePath: string = path.relative(publicRoot, entryPoint);
        const gamePath: string = relativePath.slice(0, -path.extname(relativePath).length).replaceAll(path.sep, '/');
        const pathParts: string[] = gamePath.split('/');
        if (pathParts.includes('common')) {
            throw new Error(`Public games entry point must not be named common: ${relativePath}`);
        }
        if (pathParts.length > 1 && (pathParts.length !== 2 || pathParts[0] !== 'families')) {
            throw new Error(`Unexpected nested public games entry point: ${relativePath}`);
        }
        entryPoints.set(`@everyboard/games/${gamePath}`, entryPoint);
    }
    return entryPoints;
}

const entryPoints: ReadonlyMap<string, string> = findEntryPoints();

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

function isWithin(directory: string, fileName: string): boolean {
    const relativePath: string = path.relative(directory, fileName);
    return relativePath !== '..' && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function familySourceDirectories(familyName: string, exports: readonly ExportedSymbol[]): readonly string[] {
    const directories: readonly string[] = [
        ...new Set(exports.map((exported: ExportedSymbol): string => path.dirname(exported.source))),
    ];
    const sourceSubtrees: Set<string> = new Set();
    for (const directory of directories) {
        const relativePath: string = path.relative(gamesSourceRoot, directory);
        if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
            throw new Error(`The ${familyName} family exports a symbol from outside the games source directory.`);
        }
        sourceSubtrees.add(relativePath.split(path.sep)[0]);
    }
    if (sourceSubtrees.size !== 1) {
        throw new Error(`The ${familyName} family exports symbols from unrelated game subtrees.`);
    }
    return directories;
}

function referencedFamily(entryPoint: string): string | undefined {
    const contents: string = fs.readFileSync(entryPoint, 'utf8');
    const sourceFile: ts.SourceFile = ts.createSourceFile(entryPoint, contents, ts.ScriptTarget.Latest, false);
    for (const statement of sourceFile.statements) {
        if (ts.isExportDeclaration(statement) &&
            statement.moduleSpecifier !== undefined &&
            ts.isStringLiteral(statement.moduleSpecifier) &&
            statement.moduleSpecifier.text.startsWith('./families/')) {
            return statement.moduleSpecifier.text.slice('./families/'.length);
        }
    }
    return undefined;
}

function isOwnedByGame(gameName: string, fileName: string): boolean {
    let directory: string = path.dirname(fileName);
    while (isWithin(gamesSourceRoot, directory)) {
        if (path.basename(directory) === gameName) {
            return true;
        }
        const parent: string = path.dirname(directory);
        if (parent === directory) {
            break;
        }
        directory = parent;
    }
    return false;
}

function validateExportLocation(
    moduleName: string,
    entryPoint: string,
    exported: ExportedSymbol,
    familyDirectories: ReadonlyMap<string, readonly string[]>,
): void {
    if (moduleName === '@everyboard/games' && isWithin(gamesSourceRoot, exported.source)) {
        throw new Error(
            `${exported.name} is game-specific and must not be exported from @everyboard/games; ` +
            `export it from its colocated game entry point instead.`,
        );
    }
    if (moduleName === '@everyboard/games' || moduleName === '@everyboard/games/testing') {
        return;
    }

    const publicName: string = moduleName.slice('@everyboard/games/'.length);
    if (publicName.startsWith('families/')) {
        return;
    }

    const familyName: string | undefined = referencedFamily(entryPoint);
    const directories: readonly string[] = familyName === undefined ? [] : familyDirectories.get(familyName) ?? [];
    const isConcreteExport: boolean = isOwnedByGame(publicName, exported.source);
    const isFamilyExport: boolean = directories.includes(path.dirname(exported.source));
    if (!isConcreteExport && !isFamilyExport) {
        throw new Error(
            `${moduleName} exports ${exported.name} from outside its game or family ` +
            `(${path.relative(repositoryRoot, exported.source)}).`,
        );
    }
}

function recordImports(sourceFile: ts.SourceFile, usedByModule: ReadonlyMap<string, Set<string>>): void {
    function visit(node: ts.Node): void {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier !== undefined &&
            ts.isStringLiteral(node.moduleSpecifier)) {
            const used: Set<string> | undefined = usedByModule.get(node.moduleSpecifier.text);
            if (used === undefined && node.moduleSpecifier.text.startsWith('@everyboard/games/')) {
                throw new Error(
                    `${path.relative(repositoryRoot, sourceFile.fileName)} imports unknown games entry point ` +
                    `${node.moduleSpecifier.text}.`,
                );
            }
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
    const familyDirectories: Map<string, readonly string[]> = new Map();

    for (const [moduleName, entryPoint] of entryPoints) {
        if (moduleName.startsWith('@everyboard/games/families/')) {
            const familyName: string = moduleName.slice('@everyboard/games/families/'.length);
            familyDirectories.set(
                familyName,
                familySourceDirectories(familyName, exportedSymbols(program, entryPoint)),
            );
        }
    }

    for (const [moduleName, entryPoint] of entryPoints) {
        const used: Set<string> = usedByModule.get(moduleName) ?? new Set();
        for (const exported of exportedSymbols(program, entryPoint)) {
            validateExportLocation(moduleName, entryPoint, exported, familyDirectories);
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
