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
    result?: string
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
    const tc = program.getTypeChecker();
    program.getSourceFiles().forEach((sourceFile) => {

        if (!sourceFile.fileName.includes(path)) return;

        function inspect(node: ts.Node) {
            if (ts.isFunctionDeclaration(node)) {
                const signature = tc.getSignatureFromDeclaration(node);
                const returnType = signature && tc.getReturnTypeOfSignature(signature);
                out.push({
                    name: node.name ? node.name.escapedText.toString() : 'Unknown',
                    args: node.parameters.map((p: ts.ParameterDeclaration) => (
                        {
                            name: ts.isIdentifier(p.name) ? p.name.escapedText.toString() : 'Unknown',
                            type: getArgumentType(p, tc)
                        }
                    )),
                    result: returnType && tc.typeToString(returnType),
                    doc: signature ? signature.getDocumentationComment(tc).map(({text}) => text).join('\n') : ''
                });
            } else {
                ts.forEachChild(node, n => inspect(n));
            }
        }

        inspect(sourceFile);
    });
    return out;
};

const getArgumentType = (p: ts.ParameterDeclaration, tc: ts.TypeChecker) => {
    if (!p.type) return 'Unknown';
    try {
        if (ts.isTypeReferenceNode(p.type)) {
            //todo add interface signatures
            return p.type.getText();
        } else {
            return tc.typeToString(tc.getTypeFromTypeNode(p.type));
        }
    } catch (e) {
        console.log(e.toString());
        return e.toString();
    }


};

// buildSchemas();
console.log(JSON.stringify(buildSchemas(), null, 4));
