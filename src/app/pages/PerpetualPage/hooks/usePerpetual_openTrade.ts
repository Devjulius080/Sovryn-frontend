import { useAccount } from 'app/hooks/useAccount';
import { useSendContractTx } from 'app/hooks/useSendContractTx';
import { useContext, useMemo } from 'react';
import { TxType } from 'store/global/transactions-store/types';
import { TradingPosition } from 'types/trading-position';
import { ethGenesisAddress, gasLimit } from 'utils/classifiers';
import { toWei } from 'web3-utils';
import { PerpetualQueriesContext } from '../contexts/PerpetualQueriesContext';
import {
  floatToABK64x64,
  PERPETUAL_ID,
  getSignedAmount,
} from '../utils/contractUtils';
import {
  calculateSlippagePrice,
  getRequiredMarginCollateral,
  getMidPrice,
} from '../utils/perpUtils';
import { usePerpetual_depositMarginToken } from './usePerpetual_depositMarginToken';
import { usePerpetual_marginAccountBalance } from './usePerpetual_marginAccountBalance';

const MASK_MARKET_ORDER = 0x40000000;
const MASK_CLOSE_ONLY = 0x80000000;

export const usePerpetual_openTrade = () => {
  const address = useAccount();

  const {
    ammState,
    perpetualParameters,
    depthMatrixEntries: entries,
  } = useContext(PerpetualQueriesContext);

  const marginBalance = usePerpetual_marginAccountBalance();
  const midPrice = useMemo(() => getMidPrice(perpetualParameters, ammState), [
    perpetualParameters,
    ammState,
  ]);

  let averagePrice = undefined;

  if (entries && entries.length >= 3) {
    const averagePriceIndex = entries[1].indexOf(0);
    averagePrice = entries[0][averagePriceIndex];
  }

  const { deposit } = usePerpetual_depositMarginToken();
  const { send, ...rest } = useSendContractTx('perpetualManager', 'trade');

  return {
    trade: async (
      isClosePosition: boolean | undefined = false,
      /** amount as wei string */
      amount: string = '0',
      leverage: number | undefined = 1,
      slippage: number | undefined = 0.5,
      tradingPosition: TradingPosition | undefined = TradingPosition.LONG,
    ) => {
      const signedAmount = getSignedAmount(tradingPosition, amount);

      let tradeDirection = Math.sign(signedAmount);

      const limitPrice = calculateSlippagePrice(
        averagePrice || midPrice,
        slippage,
        tradeDirection,
      );

      const marginCollateralAmount = getRequiredMarginCollateral(
        leverage,
        marginBalance.fPositionBC,
        marginBalance.fPositionBC - signedAmount,
        perpetualParameters,
        ammState,
      );

      const marginRequired = Math.max(
        0,
        marginCollateralAmount - marginBalance.fCashCC,
      );

      if (!isClosePosition && marginRequired > 0) {
        await deposit(toWei(marginRequired.toPrecision(8)));
      }

      const deadline = Math.round(Date.now() / 1000) + 86400; // 1 day
      const timeNow = Math.round(Date.now() / 1000);
      const order = [
        PERPETUAL_ID,
        address,
        floatToABK64x64(signedAmount),
        floatToABK64x64(limitPrice),
        deadline,
        ethGenesisAddress,
        isClosePosition ? MASK_CLOSE_ONLY : MASK_MARKET_ORDER,
        0,
        timeNow,
      ];

      await send(
        [order],
        {
          from: address,
          gas: gasLimit[TxType.OPEN_PERPETUAL_TRADE],
          gasPrice: 60,
        },
        { type: TxType.OPEN_PERPETUAL_TRADE },
      );
    },
    ...rest,
  };
};
