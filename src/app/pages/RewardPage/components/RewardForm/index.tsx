/**
 *
 * RewardForm
 *
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';

import { useAccount } from 'app/hooks/useAccount';
import { useCacheCallWithValue } from 'app/hooks/useCacheCallWithValue';
import { useLiquidityMining_getUserAccumulatedReward } from 'app/pages/LiquidityMining/hooks/useLiquidityMining_getUserAccumulatedReward';
import { translations } from 'locales/i18n';
import { getAmmContract } from 'utils/blockchain/contract-helpers';
import { eventReader } from 'utils/sovryn/event-reader';

import { LendingPoolDictionary } from '../../../../../utils/dictionaries/lending-pool-dictionary';
import { LiquidityPoolDictionary } from '../../../../../utils/dictionaries/liquidity-pool-dictionary';
import { useGetContractPastEvents } from '../../../../hooks/useGetContractPastEvents';
import { ClaimForm } from '../ClaimForm';

export function RewardForm() {
  const userAddress = useAccount();
  const { t } = useTranslation();
  const pools = LiquidityPoolDictionary.list();
  const lendingPools = LendingPoolDictionary.list();
  const poolAddress = Array();
  const lendReward = useGetContractPastEvents('lockedSov', 'Deposited');
  // eslint-disable-next-line array-callback-return
  pools.map(info => {
    const address = getAmmContract(info.getAsset()).address;
    poolAddress.push(address);
  });
    // for (var i = 0; i < poolAddress.length; i++) {
    //   const {
    //     value: lockedBalance,
    //   } = useLiquidityMining_getUserAccumulatedReward(poolAddress[i]);
    // }
  return (
    <ContainerBox>
      <Box>
        <div className="tw-w-1/2 tw-flex tw-justify-center tw-align-center">
          <ClaimForm address={userAddress} />
        </div>
        <Divider />
        <div className="tw-w-1/2 tw-flex w-flex-row tw-justify-center tw-align-center">
          <div></div>
          <div className="lg:tw-mr-5">
            <div className="tw-text-xs mb-2 tw-flex tw-items-center">
              <div className="tw-p-2 tw-bg-gold tw-mr-5"></div>
              50.00% - Liquidity Rewards
            </div>
            <div className="tw-text-xs mb-2 tw-flex tw-items-center">
              <div className="tw-p-2 tw-bg-white tw-mr-5"></div>
              16.66% - Lending Rewards
            </div>
            <div className="tw-text-xs mb-2 tw-flex tw-items-center">
              <div className="tw-p-2 tw-bg-green tw-mr-5"></div>
              33.33% - Trading Rewards
            </div>
          </div>
        </div>
      </Box>
      <RewardInfoBox>
        <div className="xl:tw-mx-1 tw-w-1/3 tw-bg-gray-800 tw-staking-box tw-p-4 tw-rounded-lg tw-text-sm tw-mb-4 lg:tw-mb-0">
          <div className="tw-text-xl tw-font-semibold tw-mb-9">
            {t(translations.rewardPage.topData.referralRewards)}
          </div>
          <div className="tw-flex tw-items-start">
            <div className="tw-p-2 tw-bg-gold tw-mr-5"></div>
            <div>
              <div className="mb-3">
                <p className="tw-text-xs mb-1">
                  {t(translations.rewardPage.topData.availableRewards)}
                </p>
                <p className="tw-text-xl tw-font-semibold">15.2976 SOV</p>
              </div>
              <div className="mb-3">
                <p className="tw-text-xs mb-1">
                  {t(translations.rewardPage.topData.totalRewards)}
                </p>
                <p className="tw-text-xl tw-font-semibold">73.5927 SOV</p>
              </div>
            </div>
          </div>
        </div>
        <div className="xl:tw-mx-1 tw-w-1/3 tw-bg-gray-800 tw-staking-box tw-p-4 tw-rounded-lg tw-text-sm tw-mb-4 lg:tw-mb-0">
          <div className="tw-text-xl tw-font-semibold tw-mb-9">
            {t(translations.rewardPage.topData.liquidityRewards)}
          </div>
          <div className="tw-flex tw-items-start">
            <div className="tw-p-2 tw-bg-white tw-mr-5"></div>
            <div>
              <div className="mb-3">
                <p className="tw-text-xs mb-1">
                  {t(translations.rewardPage.topData.liquidityRewards)}
                </p>
                <p className="tw-text-xl tw-font-semibold">15.2976 SOV</p>
              </div>
              <div className="mb-3">
                <p className="tw-text-xs mb-1">
                  {t(translations.rewardPage.topData.totalRewards)}
                </p>
                <p className="tw-text-xl tw-font-semibold">73.5927 SOV</p>
              </div>
            </div>
          </div>
        </div>
        <div className="xl:tw-mx-1 tw-w-1/3 tw-bg-gray-800 tw-staking-box tw-p-4 tw-rounded-lg tw-text-sm tw-mb-4 lg:tw-mb-0">
          <div className="tw-text-xl tw-font-semibold tw-mb-9">
            {t(translations.rewardPage.topData.OGRewards)}
          </div>
          <div className="tw-flex tw-items-start">
            <div className="tw-p-2 tw-bg-green tw-mr-5"></div>
            <div>
              <div className="mb-3">
                <p className="tw-text-xs mb-1">
                  {t(translations.rewardPage.topData.availableRewards)}
                </p>
                <p className="tw-text-xl tw-font-semibold">15.2976 SOV</p>
              </div>
              <div className="mb-3">
                <p className="tw-text-xs mb-1">
                  {t(translations.rewardPage.topData.totalRewards)}
                </p>
                <p className="tw-text-xl tw-font-semibold">73.5927 SOV</p>
              </div>
            </div>
          </div>
        </div>
      </RewardInfoBox>
    </ContainerBox>
  );
}

const ContainerBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Box = styled.div`
  background-color: #222222;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
const RewardInfoBox = styled.div`
  /* background-color: #222222; */
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
`;
const Divider = styled.div`
  width: 0px;
  border-width: 1px;
  height: 150px;
  border-color: #e9eae9;
`;
