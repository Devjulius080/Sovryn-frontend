import cn from 'classnames';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DialogButton } from 'app/components/Form/DialogButton';
import { ErrorBadge } from 'app/components/Form/ErrorBadge';
import { useSlippage } from 'app/pages/BuySovPage/components/BuyForm/useSlippage';
import { useMaintenance } from 'app/hooks/useMaintenance';
import { discordInvite } from 'utils/classifiers';
import { translations } from 'locales/i18n';
import { Asset } from 'types';
import {
  getLendingContractName,
  getTokenContract,
} from 'utils/blockchain/contract-helpers';
import { fromWei, toWei, weiTo18 } from 'utils/blockchain/math-helpers';
import { TradingPairDictionary } from 'utils/dictionaries/trading-pair-dictionary';
import { toNumberFormat, weiToNumberFormat } from 'utils/display-text/format';
import { TxDialog } from 'app/components/Dialogs/TxDialog';
import { LoadableValue } from 'app/components/LoadableValue';
import { Dialog } from 'app/containers/Dialog';
import { useApproveAndTrade } from 'app/hooks/trading/useApproveAndTrade';
import { useTrading_resolvePairTokens } from 'app/hooks/trading/useTrading_resolvePairTokens';
import { useAccount } from 'app/hooks/useAccount';
import { LiquidationPrice } from '../LiquidationPrice';
import { TxFeeCalculator } from '../TxFeeCalculator';
import { TradingPosition } from 'types/trading-position';
import { useGetEstimatedMarginDetails } from 'app/hooks/trading/useGetEstimatedMarginDetails';
import { selectMarginTradePage } from '../../selectors';
import { actions } from '../../slice';
import { PricePrediction } from 'app/containers/MarginTradeForm/PricePrediction';
import { AssetRenderer } from 'app/components/AssetRenderer';
import { useCurrentPositionPrice } from 'app/hooks/trading/useCurrentPositionPrice';
import { OrderTypes } from 'app/components/OrderType/types';
import { TradingTypes } from 'app/pages/SpotTradingPage/types';
import { bignumber } from 'mathjs';

const maintenanceMargin = 15000000000000000000;
interface ITradeDialogProps {
  slippage: number;
  isOpen: boolean;
  onCloseModal: () => void;
  orderType: OrderTypes;
}
export const TradeDialog: React.FC<ITradeDialogProps> = props => {
  const { t } = useTranslation();
  const account = useAccount();
  const { checkMaintenance, States } = useMaintenance();
  const openTradesLocked = checkMaintenance(States.OPEN_MARGIN_TRADES);
  const { position, amount, pairType, collateral, leverage } = useSelector(
    selectMarginTradePage,
  );

  const dispatch = useDispatch();
  const pair = useMemo(() => TradingPairDictionary.get(pairType), [pairType]);

  const {
    loanToken,
    collateralToken,
    useLoanTokens,
  } = useTrading_resolvePairTokens(pair, position, collateral);
  const contractName = getLendingContractName(loanToken);

  const { value: estimations } = useGetEstimatedMarginDetails(
    loanToken,
    leverage,
    useLoanTokens ? amount : '0',
    useLoanTokens ? '0' : amount,
    collateralToken,
  );

  const { price } = useCurrentPositionPrice(
    loanToken,
    collateralToken,
    estimations.principal,
    position === TradingPosition.SHORT,
  );

  const { minReturn: minReturnCollateral } = useSlippage(
    estimations.collateral,
    props.slippage,
  );

  const { minReturn } = useSlippage(toWei(price), props.slippage);

  const { trade, ...tx } = useApproveAndTrade(
    pair,
    position,
    collateral,
    leverage,
    amount,
    minReturnCollateral,
  );

  const submit = () => {
    trade({
      pair,
      position,
      collateralToken,
      collateral,
      leverage,
      amount,
    });
    props.onCloseModal();
  };

  const txArgs = [
    '0x0000000000000000000000000000000000000000000000000000000000000000', //0 if new loan
    toWei(String(leverage - 1), 'ether'),
    useLoanTokens ? amount : '0',
    useLoanTokens ? '0' : amount,
    getTokenContract(collateralToken).address,
    account, // trader
    minReturn,
    '0x',
  ];

  const txConf = {
    value: collateral === Asset.RBTC ? amount : '0',
  };

  return (
    <>
      <Dialog isOpen={props.isOpen} onClose={() => props.onCloseModal()}>
        <div className="tw-w-auto tw-mx-7">
          <h1 className="tw-text-sov-white tw-text-center">
            {t(translations.marginTradePage.tradeDialog.title)}
          </h1>
          <div className="tw-pt-3 tw-pb-2 tw-px-6 tw-bg-gray-2 tw-mb-4 tw-rounded-lg tw-text-sm tw-font-light">
            <div
              className={cn(
                'tw-text-center tw-font-medium tw-lowercase tw-text-xl',
                {
                  'tw-text-trade-short': position === TradingPosition.SHORT,
                  'tw-text-trade-long': position === TradingPosition.LONG,
                },
              )}
            >
              {toNumberFormat(leverage) + 'x'} {props.orderType}{' '}
              {position === TradingPosition.LONG
                ? TradingTypes.BUY
                : TradingTypes.SELL}
            </div>
            <div className="tw-text-center tw-my-1">{pair.chartSymbol}</div>
            <div className="tw-flex tw-justify-center tw-items-center">
              <LoadableValue
                loading={false}
                value={
                  <div className="tw-mr-1">{weiToNumberFormat(amount, 4)}</div>
                }
                tooltip={fromWei(amount)}
              />{' '}
              <AssetRenderer asset={collateral} />
              <div className="tw-px-1">&#64; &ge;</div>
              <PricePrediction
                position={position}
                leverage={leverage}
                loanToken={loanToken}
                collateralToken={collateralToken}
                useLoanTokens={useLoanTokens}
                weiAmount={amount}
              />
            </div>
          </div>
          <div className="tw-pt-3 tw-pb-2 tw-px-6 tw-bg-gray-2 tw-mb-4 tw-rounded-lg tw-text-sm tw-font-light">
            <TxFeeCalculator
              args={txArgs}
              txConfig={txConf}
              methodName="marginTrade"
              contractName={contractName}
              condition={true}
              textClassName={'tw-w-1/2 tw-text-gray-10 tw-text-gray-10'}
            />
            <LabelValuePair
              label={t(
                translations.marginTradePage.tradeDialog.maintananceMargin,
              )}
              value={<>{weiToNumberFormat(maintenanceMargin)} %</>}
            />
            <LabelValuePair
              label={t(translations.marginTradePage.tradeDialog.interestAPR)}
              value={<>{weiToNumberFormat(estimations.interestRate, 2)} %</>}
            />
          </div>

          <p className="tw-text-center tw-text-sm tw-mt-3 tw-mb-2">
            {t(translations.marginTradePage.tradeDialog.newPositionDetails)}
          </p>
          <div className="tw-pt-3 tw-pb-2 tw-px-6 tw-bg-gray-5 tw-mb-4 tw-rounded-lg tw-text-xs tw-font-light">
            <LabelValuePair
              label={t(translations.marginTradePage.tradeDialog.positionSize)}
              className={cn({
                'tw-text-trade-short': position === TradingPosition.SHORT,
                'tw-text-trade-long': position === TradingPosition.LONG,
              })}
              value={
                <>
                  <LoadableValue
                    loading={false}
                    value={weiToNumberFormat(
                      bignumber(amount).mul(leverage).toFixed(0),
                      4,
                    )}
                    tooltip={fromWei(
                      bignumber(amount).mul(leverage).toFixed(0),
                    )}
                  />{' '}
                  <AssetRenderer asset={collateral} />
                </>
              }
            />
            <LabelValuePair
              label={t(translations.marginTradePage.tradeDialog.margin)}
              value={
                <>
                  <LoadableValue
                    loading={false}
                    value={weiToNumberFormat(amount, 4)}
                    tooltip={fromWei(amount)}
                  />{' '}
                  <AssetRenderer asset={collateral} />
                </>
              }
            />
            <LabelValuePair
              label={t(translations.marginTradePage.tradeDialog.leverage)}
              value={
                <>
                  <LoadableValue
                    loading={false}
                    value={toNumberFormat(leverage) + 'x'}
                    tooltip={position}
                  />
                </>
              }
            />
            <LabelValuePair
              label={t(translations.marginTradePage.tradeDialog.entryPrice)}
              value={
                <>
                  <LoadableValue
                    loading={false}
                    value={weiToNumberFormat(minReturn, 2)}
                    tooltip={
                      <>
                        {weiTo18(minReturn)} {pair.longDetails.symbol}
                      </>
                    }
                  />{' '}
                  {pair.longDetails.symbol}
                </>
              }
            />
            <LabelValuePair
              label={t(
                translations.marginTradePage.tradeDialog.liquidationPrice,
              )}
              className="tw-font-medium"
              value={
                <>
                  <LiquidationPrice
                    asset={pair.shortAsset}
                    assetLong={pair.longAsset}
                    leverage={leverage}
                    position={position}
                  />{' '}
                  {pair.longDetails.symbol}
                </>
              }
            />
          </div>

          <div className="tw-mt-4">
            {openTradesLocked && (
              <ErrorBadge
                content={
                  <Trans
                    i18nKey={translations.maintenance.openMarginTrades}
                    components={[
                      <a
                        href={discordInvite}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="tw-text-warning tw-text-xs tw-underline hover:tw-no-underline"
                      >
                        x
                      </a>,
                    ]}
                  />
                }
              />
            )}

            <ErrorBadge
              content={t(
                translations.marginTradePage.tradeDialog.estimationErrorNote,
              )}
            />
          </div>

          <DialogButton
            confirmLabel={t(translations.common.confirm)}
            onConfirm={() => submit()}
            disabled={openTradesLocked}
            cancelLabel={t(translations.common.cancel)}
            onCancel={() => dispatch(actions.closeTradingModal(position))}
          />
        </div>
      </Dialog>
      <TxDialog
        tx={tx}
        onUserConfirmed={() => dispatch(actions.closeTradingModal(position))}
      />
    </>
  );
};

interface LabelValuePairProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

function LabelValuePair(props: LabelValuePairProps) {
  return (
    <div
      className={cn(
        'tw-flex tw-flex-row tw-mb-1 tw-justify-between tw-text-sov-white',
        props.className,
      )}
    >
      <div className="tw-w-1/2 tw-text-gray-10 tw-text-gray-10">
        {props.label}
      </div>
      <div className="tw-w-1/3 tw-font-medium">{props.value}</div>
    </div>
  );
}
