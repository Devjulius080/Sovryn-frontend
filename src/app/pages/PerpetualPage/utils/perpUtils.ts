/*
 * Custom frontend perpUtils
 */

import { numberFromWei } from 'utils/blockchain/math-helpers';
import { gasLimit } from 'utils/classifiers';
import { TxType } from '../../../../store/global/transactions-store/types';
import {
  TraderState,
  AMMState,
  PerpParameters,
  perpUtils,
} from '@sovryn/perpetual-swap';
import { keccak256, defaultAbiCoder, toUtf8Bytes } from 'ethers/lib/utils';

const { getTraderPnL, getMarkPrice, getRequiredMarginCollateral } = perpUtils;

/**
 * Get the unrealized Profit/Loss of a trader using mark price as benchmark. Reported in Base currency.
 * @param {AMMState} ammState - AMM state (for mark price and CCY conversion)
 * @param {TraderState} traderState - Trader state (for account balances)
 * @returns {number} PnL = value of position at mark price minus locked in value
 */
export function getTraderPnLInBC(
  traderState: TraderState,
  ammState: AMMState,
  perpParams: PerpParameters,
): number {
  return (
    getTraderPnL(traderState, ammState, perpParams) / getMarkPrice(ammState)
  );
}

/**
 * Get the amount of collateral required to obtain a given leverage with a given position size.
 * Considers the trading fees and gas fees.
 * @param {number} leverage - The leverage that the trader wants to achieve, given the position size
 * @param {number} targetPos  - The trader's (signed) target position in base currency
 * @param {PerpParameters} perpParams - Contains parameter of the perpetual
 * @param {AMMState} ammData - AMM state
 * @param {TraderState} traderState - Trader state
 * @param {number} slippagePercent - optional. Specify slippage compared to mid-price that the trader is willing to accept
 * @param {boolean} useMetaTransactions - optional, default false. Adds gas fees to the total
 * @param {boolean} accountForExistingMargin - optional, default false. If true, subtracts existing margin and clamp to 0
 * @param {boolean} accountForExistingPosition - optional, default false. If false, the margin for a trade is calculated
 * @returns {number} balance required to arrive at the perpetual contract to obtain requested leverage
 */
export function getRequiredMarginCollateralWithGasFees(
  leverage: number,
  targetPos: number,
  perpParams: PerpParameters,
  ammData: AMMState,
  traderState: TraderState,
  slippagePercent: number = 0,
  useMetaTransactions: boolean = false,
  accountForExistingMargin: boolean = false,
  accountForExistingPosition: boolean = false,
) {
  let requiredCollateral = getRequiredMarginCollateral(
    leverage,
    targetPos,
    perpParams,
    ammData,
    traderState,
    slippagePercent,
    accountForExistingMargin,
    accountForExistingPosition,
  );

  if (useMetaTransactions) {
    requiredCollateral += numberFromWei(gasLimit[TxType.PERPETUAL_TRADE]);
  }

  return requiredCollateral;
}

// FIXME: move to @sovryn/perpetual-swap
export const MASK_CLOSE_ONLY = 0x80000000;
export const MASK_MARKET_ORDER = 0x40000000;
export const MASK_STOP_LOSS_ORDER = 0x20000000;
export const MASK_TAKE_PROFIT_ORDER = 0x10000000;
export const MASK_USE_TARGET_LEVERAGE = 0x08000000;
export const MASK_LIMIT_ORDER = 0x04000000;

// FIXME: move to @sovryn/perpetual-swap
export async function createOrderDigest(
  order: any,
  isNewOrder: boolean,
  managerAddress: string,
  chainId: number,
): Promise<string> {
  const NAME = toUtf8Bytes('Perpetual Trade Manager');
  const DOMAIN_TYPEHASH = keccak256(
    toUtf8Bytes(
      'EIP712Domain(string name,uint256 chainId,address verifyingContract)',
    ),
  );
  let domainSeparator = keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'uint256', 'address'],
      [DOMAIN_TYPEHASH, keccak256(NAME), chainId, managerAddress],
    ),
  );
  const TRADE_ORDER_TYPEHASH = keccak256(
    toUtf8Bytes(
      'Order(bytes32 iPerpetualId,address traderAddr,int128 fAmount,int128 fLimitPrice,int128 fTriggerPrice,uint256 iDeadline,address referrerAddr,uint32 flags,int128 fLeverage,uint256 createdTimestamp)',
    ),
  );
  let structHash = keccak256(
    defaultAbiCoder.encode(
      [
        'bytes32',
        'bytes32',
        'address',
        'int128',
        'int128',
        'int128',
        'uint256',
        'address',
        'uint32',
        'int128',
        'uint256',
      ],
      [
        TRADE_ORDER_TYPEHASH,
        order.iPerpetualId,
        order.traderAddr,
        order.fAmount,
        order.fLimitPrice,
        order.fTriggerPrice,
        order.iDeadline,
        order.referrerAddr,
        order.flags,
        order.fLeverage,
        order.createdTimestamp,
      ],
    ),
  );
  let digest = keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bool'],
      [domainSeparator, structHash, isNewOrder],
    ),
  );
  return digest;
}
