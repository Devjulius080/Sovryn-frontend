import { getContract } from 'utils/blockchain/contract-helpers';
import { TxType } from 'store/global/transactions-store/types';
import { gasLimit } from 'utils/classifiers';
import {
  CheckAndApproveResult,
  contractWriter,
} from 'utils/sovryn/contract-writer';
import { useSendContractTx } from 'app/hooks/useSendContractTx';
import { Asset } from 'types';
import { useAccount } from 'app/hooks/useAccount';

export const useApproveAndContribute = () => {
  const account = useAccount();

  const { send, ...rest } = useSendContractTx('ZERO_token', 'contribute');

  return {
    contribute: async (
      destinationWeiAmount: string,
      destinationToken: Asset | string,
      sourceWeiAmount: string,
      sourceToken: Asset,
    ) => {
      const tx: CheckAndApproveResult = await contractWriter.checkAndApprove(
        sourceToken,
        '0xfA1fCaa199b02235dE2Be7Bf17fd174cc72f1D60', // presale contract
        sourceWeiAmount,
      );

      if (tx.rejected) {
        return;
      }

      send(
        [sourceWeiAmount],
        {
          from: account,
          gas: gasLimit[TxType.ORIGINS_SALE_BUY],
          nonce: tx?.nonce,
          // value: sourceWeiAmount,
        },
        {
          type: TxType.ORIGINS_SALE_BUY,
          customData: {
            date: new Date().getTime() / 1000,
            sourceAmount: sourceWeiAmount,
            destinationAmount: destinationWeiAmount,
            sourceToken: sourceToken,
            destinationToken: destinationToken,
          },
        },
      );
    },
    ...rest,
  };
};
