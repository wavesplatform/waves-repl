import * as ts from 'typescript';
import { resolve } from 'path';
import * as fs from 'fs';

import { TFunction, TType, TUnion } from '@waves/ride-js';
import { schemas } from '@waves/tx-json-schemas';

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

    const out: TFunction[] = [];

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
                            type: getArgumentType(p, tc),
                            optional: tc.isOptionalParameter(p),
                            doc: '' //todo get a doc
                        }
                    )),
                    resultType: returnType && tc.typeToString(returnType) || 'Unknown',//todo make normal type
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

const getArgumentType = (p: ts.ParameterDeclaration, tc: ts.TypeChecker): TType => {
    if (!p.type) return 'Unknown';
    const split = p.type.getText().split('|');
    if (split.length === 1) {
        return defineType(split[0].replace(' ', ''));
    } else {
        return (split.map((item): TType => defineType(item.replace(' ', ''))) as TUnion);
    }

};

const defineType = (name: string): TType => {
    const schema = (schemas as any)[name];
    if (schema) {
        return {
            typeName: schema.type,
            fields: schema.properties && Object.keys(schema.properties).map((prop) => ({
                    name: prop,
                    type: schema.properties[prop].type
                        || schema.definitions[schema.properties[prop].$ref.split('/').pop()].type,
                    doc: schema.properties[prop].description,
                    optional: !schema.required.includes(prop),
                })
            )
        };
    } else {
        return name;
    }

};

const filePath = './src/schemas/envFunctions.json';
const out = JSON.stringify(buildSchemas(), null, 4);
try {
    fs.unlinkSync(filePath);
} catch (e) {
}
fs.appendFile(filePath, (out), function (err) {
    if (err) throw err;
    console.log('✅ -> Schemas were saved to ' + filePath);
});
