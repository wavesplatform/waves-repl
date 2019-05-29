import * as wt from '@waves/waves-transactions';
import {
    IAliasParams,
    IAliasTransaction,
    IBurnParams,
    IBurnTransaction,
    ICancelLeaseParams,
    ICancelLeaseTransaction,
    WithId
} from '@waves/waves-transactions/src/transactions';
import { TSeedTypes } from '@waves/waves-transactions/src/types';
import { WavesConsoleAPI } from '../src/WavesConsoleAPI';

/**
 * Test function returns input string + '!'
 */
function test(in1: string, in2: string, opt?: string) {
    const out = in1 + in2 + '!';
    return opt ? out + out : out;
};


/**
 * Creates signed createAlias transaction
 */
function alias(paramsOrTx: IAliasParams, seed?: TSeedTypes): IAliasTransaction & WithId {
    const _seed = seed ? seed : WavesConsoleAPI.env.SEED;
    return wt.alias(paramsOrTx, _seed);
}

/**
 * Creates signed burn transaction
 */
function burn(params: IBurnParams, seed: TSeedTypes): IBurnTransaction & WithId {
    const _seed = seed ? seed : WavesConsoleAPI.env.SEED;
    return wt.burn(params, _seed);
}

/**
 * Creates signed cancelLease transaction
 */
function cancelLease(params: ICancelLeaseParams, seed: TSeedTypes): ICancelLeaseTransaction & WithId {
    const _seed = seed ? seed : WavesConsoleAPI.env.SEED;
    return wt.cancelLease(params, _seed);
}


export {
    alias,
    burn,
    cancelLease,
    test
};
