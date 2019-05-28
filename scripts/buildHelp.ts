import * as ts from 'typescript';
import { resolve } from 'path';

function getProgramFromFiles(files: string[], jsonCompilerOptions: any = {}, basePath: string = './'): ts.Program {
    const compilerOptions = ts.convertCompilerOptionsFromJson(jsonCompilerOptions, basePath).options;
    const options: ts.CompilerOptions = {
        noEmit: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
        allowUnusedLabels: true,
    };
    for (const k in compilerOptions) {
        if (compilerOptions.hasOwnProperty(k)) {
            options[k] = compilerOptions[k];
        }
    }

    return ts.createProgram(files, options);
}

export type TSignature = {
    name: string
    args: TArg[]
    doc?: string
    description?: string
};

export type TArg = {
    name: string
    type: string
    doc?: string
    optional?: boolean
};

const buildSchemas = () => {

    // const path = 'node_modules/@waves/waves-transactions/dist/transactions.d.ts';

    const out: TSignature[] = [];

    const path = 'scripts/testFunc.ts';
    const program = getProgramFromFiles([resolve(path)]);
    const typeChecker = program.getTypeChecker();
    program.getSourceFiles().forEach((sourceFile) => {
        if (!sourceFile.fileName.includes(path)) return;

        function inspect(node: ts.Node) {
            if (ts.isFunctionDeclaration(node)) {
                console.log(`{
 name: ${node.name!.escapedText},
 args: ${JSON.stringify(node.parameters.map(p => ({
                    name: (p.name as any).escapedText,
                    type: p.type!.kind
                })))}
 doc: ,
 
                    
}`);
// args: ${node.parameters}
            } else {
                ts.forEachChild(node, n => inspect(n));
            }
        }

        inspect(sourceFile);
    });
};


buildSchemas();
