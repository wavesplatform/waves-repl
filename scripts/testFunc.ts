/**
 * Generates API method arguments description
 *
 * @static
 * @method compileTextArguments
 *
 * @param {Array} args
 *
 * @returns {TArg[]}
 */
import { TArg, WavesConsoleAPIHelp } from '../src/WavesConsoleAPI';

function compileTextArguments(args: Array<string>): TArg[] {
    let module: any = WavesConsoleAPIHelp;
    const out: TArg[] = [];
    args.forEach((argument: string) => {
        if (module.types[argument]) {
            out.push({
                name: argument,
                type: module.types[argument].type,
                doc: module.types[argument].summary
            });
        }

    });
    return out;
};
