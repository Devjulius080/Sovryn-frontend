import React, { FormEvent } from 'react';
import { numberFromWei } from 'utils/helpers';
import { CacheCallResponse } from 'app/hooks/useCacheCall';
import { StakingDateSelector } from '../../../components/StakingDateSelector';
import moment from 'moment';

interface Props {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  amount: string;
  timestamp?: number;
  onChangeTimestamp: (value: number) => void;
  sovBalanceOf: CacheCallResponse;
  isValid: boolean;
  kickoff: CacheCallResponse;
  balanceOf: CacheCallResponse;
  stakes: undefined;
  votePower?: number;
  prevExtend: number;
  onCloseModal: () => void;
}

export function ExtendStakeForm(props: Props) {
  return (
    <>
      <h3 className="tw-text-center tw-mb-10 tw-leading-10 tw-text-3xl">
        Extend SOV Stake
      </h3>
      <div className="tw-text-gray-5 tw-mb-4 md:tw-px-9 tw-tracking-normal tw-text-xs">
        Previous until:
        <br />
        <span className="tw-font-bold">
          {moment(new Date(props.prevExtend * 1e3)).format('DD.MM.YYYY')}
        </span>
      </div>
      <form onSubmit={props.handleSubmit}>
        <div className="tw-mb-9 md:tw-px-9 tw-tracking-normal">
          <label
            className="tw-leading-4 tw-block tw-text-theme-white tw-text-md tw-font-medium tw-mb-2"
            htmlFor="amount"
          >
            Amount to Stake:
          </label>
          <div className="tw-flex tw-space-x-4 tw-relative">
            <input
              readOnly
              className="tw-appearance-none tw-border tw-border-solid tw-border-theme-white tw-text-md tw-font-semibold tw-text-center tw-h-10 tw-rounded-lg tw-w-full tw-py-2 tw-px-14 tw-bg-black tw-text-theme-white tw-tracking-normal focus:tw-outline-none focus:tw-shadow-outline"
              id="amount"
              type="text"
              defaultValue={props.amount}
            />
            <span className="tw-text-theme-white tw-text-md tw-font-semibold tw-absolute tw-top-3 tw-right-5 tw-leading-4">
              SOV
            </span>
          </div>

          <StakingDateSelector
            title="Select new date"
            kickoffTs={Number(props.kickoff.value)}
            value={props.timestamp}
            onClick={value => props.onChangeTimestamp(value)}
            stakes={props.stakes}
            prevExtend={props.prevExtend}
            delegate={false}
          />

          <label
            className="tw-block tw-text-theme-white tw-text-md tw-font-medium tw-mb-2 tw-mt-8"
            htmlFor="voting-power"
          >
            Voting Power received:
          </label>
          <div className="tw-flex tw-space-x-4">
            <input
              readOnly
              className="tw-border tw-border-gray-200 tw-border-opacity-100 tw-border-solid tw-appearance-none tw-text-md tw-font-semibold tw-text-center tw-h-10 tw-rounded-lg tw-w-full tw-py-2 tw-px-3 tw-bg-transparent tw-tracking-normal focus:tw-outline-none focus:tw-shadow-outline"
              id="voting-power"
              type="text"
              placeholder="0"
              value={numberFromWei(props.votePower)}
            />
          </div>
          <p className="tw-block tw-text-theme-white tw-text-md tw-font-light tw-mb-2 tw-mt-7">
            Tx Fee: 0.0006 rBTC
          </p>
          <div className="tw-text-gray-700 tw-text-xs tw-mt-3 tw-hidden">
            Balance:{' '}
            <span
              className={`tw-text-gray-900 ${
                props.sovBalanceOf.loading && 'skeleton'
              }`}
            >
              {numberFromWei(props.sovBalanceOf.value).toLocaleString()}
            </span>{' '}
            SoV
            {Number(props.votePower) > 0 && (
              <>
                <br />
                Will be added to your vote: +{' '}
                {numberFromWei(props.votePower).toLocaleString()}
              </>
            )}
          </div>
        </div>
        <div className="tw-grid tw-grid-rows-1 tw-grid-flow-col tw-gap-4">
          <button
            type="submit"
            className={`tw-uppercase tw-w-full tw-text-black tw-bg-gold tw-text-xl tw-font-extrabold tw-px-4 hover:tw-bg-opacity-80 tw-py-2 tw-rounded-lg tw-transition tw-duration-500 tw-ease-in-out ${
              !props.isValid &&
              'tw-opacity-50 tw-cursor-not-allowed hover:tw-bg-opacity-100'
            }`}
            disabled={!props.isValid}
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => props.onCloseModal()}
            className="tw-border tw-border-gold tw-rounded-lg tw-text-gold tw-uppercase tw-w-full tw-text-xl tw-font-extrabold tw-px-4 tw-py-2 hover:tw-bg-gold hover:tw-bg-opacity-40 tw-transition tw-duration-500 tw-ease-in-out"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
