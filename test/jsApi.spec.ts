import * as SA from '@waves/signature-adapter'
import {create, MAINNET_CONFIG} from '@waves/waves-api';
import {expect, assert} from 'chai'
import {describe, before, it} from 'mocha';

describe('sandbox', () => {
    const w = create(MAINNET_CONFIG)
    const adapter = new SA.SeedAdapter('seeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed')

    console.dir(w, {depth:null})
})