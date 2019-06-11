import * as wt from '@waves/waves-transactions';
import { WavesConsoleAPI } from '../WavesConsoleAPI';
import {
    IAliasParams,
    IAliasTransaction,
    IBurnParams,
    IBurnTransaction,
    WithId,
    WithSender
} from '@waves/waves-transactions/src/transactions';
import { TSeedTypes } from '@waves/waves-transactions/src/types';

const assetBalance = async (assetId: string, address?: string, apiBase?: string) =>
    wt.nodeInteraction.assetBalance(assetId, address || 'this.currentAddress()', apiBase || WavesConsoleAPI.env.API_BASE);

const balanceDetails = async (address?: string, apiBase?: string) =>
    wt.nodeInteraction.balanceDetails(address || 'this.currentAddress()', apiBase || WavesConsoleAPI.env.API_BASE);

const alias = (paramsOrTx: IAliasParams & WithSender | IAliasTransaction, seed?: TSeedTypes): IAliasTransaction & WithId =>
    wt.alias(paramsOrTx, seed);

const burn = (paramsOrTx: IBurnParams & WithSender | IBurnTransaction, seed?: TSeedTypes): IBurnTransaction & WithId =>
    wt.burn(paramsOrTx, seed);
