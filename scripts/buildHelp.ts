import * as ts from 'typescript';
import { resolve } from 'path';
import * as fs from 'fs';
import {  TList, TPrimitive, TStruct, TStructField, TType, TUnion } from '@waves/ride-js';
import { schemas } from '@waves/tx-json-schemas';
import { TSeedTypes } from '@waves/waves-transactions';

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


type TResultTypeTip = {
    type: TType
    range: {
        start: number
        end: number
    }
};

export type TArgument = {
    name: string
    type: TType
    optional?: boolean
    doc?: string
};

export type TSchemaType = {
    name: string
    resultType: TType
    resultTypeTips: TResultTypeTip[]
    args: TArgument[]
    doc?: string
};

const replFuncs: TSchemaType[] = [
    {
        name: 'help',
        resultType: '',
        resultTypeTips: [],
        args: [{
            name: 'func',
            type: 'string',
            optional: true,
            doc: 'You can use help(functionName) to get info for the specified function.'
        }],
        doc: 'Help for the available API functions\n\nYou can use help() to get list of available functions ' +
            'or help(functionName) to get info for the specified function.',
    },
    {
        name: 'clear',
        resultType: '',
        resultTypeTips: [],
        args: [],
        doc: 'clear console'
    },
    {
        name: 'deploy',
        resultType: '',
        resultTypeTips: [],
        args: [
            {
                name: 'params',
                optional: true,
                type: '{ fee?: number, senderPublicKey?: string, script?: string }',
            },
            {
                name: 'seed',
                optional: true,
                type: 'TSeedTypes',
            },
        ],
        doc: 'Compile currently selected contract and deploy it to default account'
    }
];

const buildSchemas = () => {

    const out: TSchemaType [] = replFuncs;

    const path = 'node_modules/@waves/js-test-env/index.d.ts';
    const program = getProgramFromFiles([resolve(path)]);
    const tc = program.getTypeChecker();
    program.getSourceFiles().forEach((sourceFile) => {

        if (!sourceFile.fileName.includes(path)) return;

        function inspect(node: ts.Node) {
            if (ts.isFunctionDeclaration(node)) {
                const signature = tc.getSignatureFromDeclaration(node);
                const returnTypeObject = signature && tc.getReturnTypeOfSignature(signature);
                let returnType = 'Unknown';
                const returnTypeTips: TResultTypeTip[] = [];

                if (returnTypeObject) {
                    returnType = tc.typeToString(returnTypeObject);
                    Object.keys(schemas).forEach(type =>
                        returnType.includes(type) && returnTypeTips.push({
                            range: {start: returnType.search(type), end: returnType.search(type) + type.length - 1},
                            type: defineType(type)
                        })
                    );
                }
                out.push({
                    name: node.name ? node.name.escapedText.toString() : 'Unknown',
                    args: node.parameters.map((p: ts.ParameterDeclaration) => (
                        {
                            name: ts.isIdentifier(p.name) ? p.name.escapedText.toString() : 'Unknown',
                            type: getArgumentType(p),
                            optional: tc.isOptionalParameter(p),
                            doc: ts.getJSDocType(p) !== undefined ? ts.getJSDocType(p)!.toString() : ''
                        }
                    )),
                    resultType: returnType,
                    resultTypeTips: returnTypeTips,
                    doc: ((node as any).jsDoc || []).map(({comment}: any) => comment).join('\n')
                });
            } else {
                ts.forEachChild(node, n => inspect(n));
            }
        }

        inspect(sourceFile);
    });
    return out;
};

const getArgumentType = (p: ts.ParameterDeclaration): TType => {
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
            typeName: name,
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
