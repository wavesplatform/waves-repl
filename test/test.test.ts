import { resolve } from "path";
// import { getProgramFromFiles, getReferenceSignature } from '../scripts/interfaceParser';
import * as ts from 'typescript';


describe('foo', () => {
    it('test', () => {

        //
        // const path = 'node_modules/@waves/waves-transactions/src/transactions.ts';
        // // const program = getProgramFromFiles([resolve(path)]);
        // const tc = program.getTypeChecker();
        // let out: any = {};
        // program.getSourceFiles().forEach((sourceFile) => {
        //
        //     if (!sourceFile.fileName.includes(path)) return;
        //
        //     function inspect(node: ts.Node) {
        //         if (ts.isTypeReferenceNode(node)) {
        //             const symbol = tc.getTypeFromTypeNode(node).symbol;
        //             if (symbol && symbol.members) {
        //                 out[node.typeName.getText()] = getReferenceSignature(symbol, tc);
        //             } else {
        //                 // console.log(symbol)
        //             }
        //         } else {
        //             ts.forEachChild(node, n => inspect(n));
        //         }
        //     }
        //
        //     inspect(sourceFile);
        // });
        //
        //
        // console.log(JSON.stringify(out, null, 4));

    });
});
