import * as ts from 'typescript';
import { resolve } from 'path';

export function getProgramFromFiles(files: string[], jsonCompilerOptions: any = {}, basePath: string = './'): ts.Program {
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

export const getArgumentType = (p: ts.ParameterDeclaration, tc: ts.TypeChecker) => {
    if (!p.type) return 'Unknown';
    try {
        if (ts.isTypeReferenceNode(p.type)) {
            const out = p.type.getText();
            const symbol = tc.getTypeFromTypeNode(p.type).symbol;
            if (symbol && symbol.members) {
                console.log(symbol.getName());
                console.log((symbol.getJsDocTags()));
                console.log(symbol.members.forEach(val => console.log(val.getName(), tc.typeToString(tc.getDeclaredTypeOfSymbol(symbol)))));
                console.log('===============================================================');
                // console.log(tc.getDeclaredTypeOfSymbol(symbol));
                // console.log(tc.getTypeOfSymbolAtLocation(symbol, p.type));
                /*todo parse interfaces from /waves-transactions/src/transactions.ts
                  todo and parse functions
                */
            }
            return out;
        } else {
            return tc.typeToString(tc.getTypeFromTypeNode(p.type));
        }
    } catch (e) {
        console.log(e.toString());
        return e.toString();
    }


};

export function getReferenceSignature(symbol: ts.Symbol, tc: ts.TypeChecker) {
    const members: TMember[] = [];
    symbol.members!.forEach(val => members.push({
        name: val.getName(),
        type: grtMemberType(val, tc),
        doc: symbol.getDocumentationComment(tc).map(({text}) => text).join('\n'),
    }));
    // if (symbol.members) {
    //     symbol.members.forEach(val => console.log(val));
    // }
    const out: TInterface = {
        name: symbol.getName(),
        doc: symbol.getJsDocTags().map(({text}) => text).join('\n'),
        members: members
    };
    // console.log(symbol.getName());
    // console.log((symbol.getJsDocTags()));
    // console.log(symbol.members!.forEach(val => console.log(val.getName(), tc.typeToString(tc.getDeclaredTypeOfSymbol(symbol)))));
    // console.log('===============================================================');
    // console.log(tc.getDeclaredTypeOfSymbol(symbol));
    // console.log(tc.getTypeOfSymbolAtLocation(symbol, p.type));
    return out;

}

export function grtMemberType(symbol: ts.Symbol, tc: ts.TypeChecker) {
    const type = tc.getDeclaredTypeOfSymbol(symbol);
    const decl = tc.symbolToParameterDeclaration(symbol);
    if (type.getDefault()) {
        return `${tc.typeToString(type)} <${(type.getDefault() as any)
            .types.map(({intrinsicName}: any) => intrinsicName).join('|')}>`;
    }
    if (decl && decl.type) {
        return (<any> ts).SyntaxKind[decl.type.kind];
    }
    return tc.typeToString(type);
}


// const path = 'node_modules/@waves/waves-transactions/dist/transactions.d.ts';

type TMember = {
    name: string,
    type: string
    doc?: string,
};

type TInterface = {
    name: string,
    members: TMember[]
    doc?: string,
}

const path = 'node_modules/@waves/waves-transactions/src/transactions.ts';
const program = getProgramFromFiles([resolve(path)]);
const tc = program.getTypeChecker();
let out: any = {};
program.getSourceFiles().forEach((sourceFile) => {

    if (!sourceFile.fileName.includes(path)) return;

    function inspect(node: ts.Node) {
        if (ts.isTypeReferenceNode(node)) {
            const symbol = tc.getTypeFromTypeNode(node).symbol;
            if (symbol && symbol.members) {
                out[node.typeName.getText()] = getReferenceSignature(symbol, tc);
            } else {
                // console.log(symbol)
            }
        } else {
            ts.forEachChild(node, n => inspect(n));
        }
    }

    inspect(sourceFile);
});


console.log(JSON.stringify(out, null, 4));
