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

const buildSchemas = () => {

    // const path = 'node_modules/@waves/waves-transactions/dist/transactions.d.ts';
    const path = 'scripts/testFunc.ts';
    const program = getProgramFromFiles([resolve(path)]);
    const typeChecker = program.getTypeChecker();
    program.getSourceFiles().forEach((sourceFile) => {
        if (!sourceFile.fileName.includes(path)) return;
        function inspect(node: ts.Node) {
            if (ts.isFunctionDeclaration(node)) {
                const signature = typeChecker.getSignatureFromDeclaration(node);
                const returnType = typeChecker.getReturnTypeOfSignature(signature!);
                const parameters = node.parameters; // array of Parameters
                // const docs = node.jsDoc; // array of js docs
                console.log(node.name!.escapedText);
                console.log(signature);
                console.log(returnType);
                console.log(parameters);
            } else {
                ts.forEachChild(node, n => inspect(n));
            }
        }

        inspect(sourceFile);
    });
};


buildSchemas();
