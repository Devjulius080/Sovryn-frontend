import {
  PerpetualPairType,
  PerpetualPairDictionary,
} from '../../../../utils/dictionaries/perpetual-pair-dictionary';
import { PerpetualTradeType, LimitOrderType } from '../types';

import { useMemo, useEffect } from 'react';

import debounce from 'lodash.debounce';
import { ABK64x64ToFloat } from '@sovryn/perpetual-swap/dist/scripts/utils/perpMath';
import { BigNumber } from 'ethers';
import {
  Event,
  EventQuery,
  useGetTraderEvents,
} from './graphql/useGetTraderEvents';

export type OpenOrderEntry = {
  id: string;
  pairType: PerpetualPairType;
  type?: PerpetualTradeType;
  limitPrice: number;
  triggerPrice: number;

  createdAt?: string;
  positionSize: number;
  expiry: number;
};

type OpenOrdersHookResult = {
  loading: boolean;
  data?: OpenOrderEntry[];
};

export const usePerpetual_OpenOrders = (
  address: string,
): OpenOrdersHookResult => {
  const eventQuery = useMemo(
    (): EventQuery[] => [
      {
        event: Event.LIMIT_ORDER,
        whereCondition: `state: Active`,
        page: 1, // TODO: Add a proper pagination once we have a total limit orders field in the subgraph
        perPage: 10,
      },
    ],
    [],
  );

  const {
    data: tradeEvents,
    previousData: previousTradeEvents,
    refetch,
    loading,
  } = useGetTraderEvents(address.toLowerCase(), eventQuery);

  const data = useMemo(() => {
    const currentPositions: LimitOrderType[] | undefined =
      tradeEvents?.trader?.limitOrders ||
      previousTradeEvents?.trader?.limitOrders;

    if (!currentPositions) {
      return;
    }

    const result: OpenOrderEntry[] = currentPositions.reduce(
      (acc, position) => {
        const pair = PerpetualPairDictionary.getById(position.perpetual.id);

        const triggerPrice = ABK64x64ToFloat(
          BigNumber.from(position.triggerPrice),
        );

        acc.push({
          id: position.id,
          pairType: pair?.pairType,
          type:
            triggerPrice > 0
              ? PerpetualTradeType.STOP_LOSS
              : PerpetualTradeType.LIMIT,
          triggerPrice,
          limitPrice: ABK64x64ToFloat(BigNumber.from(position.limitPrice)),
          positionSize: 100,
          expiry: 30,
        });

        return acc;
      },
      [] as any,
    );

    return result;
  }, [
    previousTradeEvents?.trader?.limitOrders,
    tradeEvents?.trader?.limitOrders,
  ]);

  const refetchDebounced = useMemo(
    () =>
      debounce(refetch, 1000, {
        leading: false,
        trailing: true,
        maxWait: 1000,
      }),
    [refetch],
  );

  useEffect(() => {
    refetchDebounced();
  }, [refetchDebounced]);

  return { data, loading };
};