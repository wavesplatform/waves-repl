/**
 * Test function returns input string + '!'
 *
 * @static
 * @method compileTextArguments
 *
 *
 * @returns {string}
 * @param in1
 * @param in2
 * @param opt
 */
function test(in1: string, in2: string, opt?: string) {
    const out = in1 + in2 + '!';
    return opt ? out + out : out;
};
