import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Tab } from '../../components/Tab';
import { actions as walletProviderActions } from 'app/containers/WalletProvider/slice';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { translations } from 'locales/i18n';

import { reducer, sliceKey, actions } from './slice';
import { perpetualPageSaga } from './saga';
import { HeaderLabs } from '../../components/HeaderLabs';
import { Footer } from '../../components/Footer';
import {
  PerpetualPairDictionary,
  PerpetualPairType,
} from '../../../utils/dictionaries/perpetual-pair-dictionary';
import { Theme, TradingChart } from './components/TradingChart';
import { OpenPositionsTable } from './components/OpenPositionsTable';
import { useIsConnected } from '../../hooks/useAccount';
import { useHistory, useLocation } from 'react-router-dom';
import { IPromotionLinkState } from '../LandingPage/components/Promotions/components/PromotionCard/types';
import { NotificationSettingsDialog } from './components/NotificationSettingsDialog';
import { selectPerpetualPage } from './selectors';
import { DataCard } from './components/DataCard';
import { AmmDepthChart } from './components/AmmDepthChart';
import { RecentTradesTable } from './components/RecentTradesTable';
import { ContractDetails } from './components/ContractDetails';
import { isMainnet, discordInvite } from '../../../utils/classifiers';
import { ChainId } from '../../../types';
import { useWalletContext } from '@sovryn/react-wallet';
import { ProviderType } from '@sovryn/wallet';
import { AccountBalanceCard } from './components/AccountBalanceCard';
import { AccountDialog } from './components/AccountDialog';
import { NewPositionCard } from './components/NewPositionCard';
import { TradeDialog } from './components/TradeDialog';
import { EditPositionSizeDialog } from './components/EditPositionSizeDialog';
import { EditLeverageDialog } from './components/EditLeverageDialog';
import { EditMarginDialog } from './components/EditMarginDialog';
import { RecentTradesContextProvider } from './contexts/RecentTradesContext';
import { ClosePositionDialog } from './components/ClosePositionDialog';
import { ClosedPositionsTable } from './components/ClosedPositionsTable';
import { OrderHistoryTable } from './components/OrderHistoryTable/index';
import { FundingPaymentsTable } from './components/FundingPaymentsTable/index';
import { PerpetualQueriesContextProvider } from './contexts/PerpetualQueriesContext';
import { PairSelector } from './components/PairSelector';
import { ToastsWatcher } from './components/ToastsWatcher';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export const PerpetualPageContainer: React.FC = () => {
  useInjectReducer({ key: sliceKey, reducer });
  useInjectSaga({ key: sliceKey, saga: perpetualPageSaga });

  const dispatch = useDispatch();
  const walletContext = useWalletContext();

  const [
    showNotificationSettingsModal,
    setShowNotificationSettingsModal,
  ] = useState(false);

  const { pairType, collateral } = useSelector(selectPerpetualPage);
  const { t } = useTranslation();

  const location = useLocation<IPromotionLinkState>();
  const history = useHistory<IPromotionLinkState>();

  const [linkPairType, setLinkPairType] = useState(
    location.state?.perpetualPair,
  );

  const pair = useMemo(
    () => PerpetualPairDictionary.get(linkPairType || pairType),
    [linkPairType, pairType],
  );

  const connected = useIsConnected();
  const [activeTab, setActiveTab] = useState(0);

  const onChangePair = useCallback(
    (pairType: PerpetualPairType) => dispatch(actions.setPairType(pairType)),
    [dispatch],
  );

  useEffect(() => {
    setLinkPairType(location.state?.perpetualPair);
    history.replace(location.pathname);

    if (walletContext.provider !== ProviderType.WEB3) {
      walletContext.disconnect();
    }

    //set the bridge chain id to BSC
    dispatch(
      walletProviderActions.setBridgeChainId(
        isMainnet ? ChainId.BSC_MAINNET : ChainId.BSC_TESTNET,
      ),
    );

    return () => {
      // Unset bridge settings
      dispatch(walletProviderActions.setBridgeChainId(null));
      dispatch(actions.reset());
    };

    // only run once on mounting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RecentTradesContextProvider pair={pair}>
      <PerpetualQueriesContextProvider pair={pair}>
        <Helmet>
          <title>{t(translations.perpetualPage.meta.title)}</title>
          <meta
            name="description"
            content={t(translations.perpetualPage.meta.description)}
          />
        </Helmet>
        <HeaderLabs
          helpLink="https://wiki.sovryn.app/en/sovryn-dapp/perpetual-futures"
          menus={
            <Link to="/perpetuals/competition" className="tw-text-black">
              <>Competition</>
            </Link>
          }
        />
        <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-gray-5 tw-bg-opacity-50 tw-blur">
          <div className="tw-w-full tw-max-w-3xl tw-bg-black tw-text-sov-white tw-p-8 tw-rounded-xl">
            <h2 className="tw-mb-4">
              The Sovryn Perpetual Futures Trading Competition has ended!
            </h2>
            <p>
              A special thanks to everyone that participated! We hope you had
              fun while helping us stress-test the perpetual futures interface
              and backend. Your participation and feedback has provided us with
              invaluable information and improvement suggestions, all of which
              will be used to refine the functionality and interface prior to
              launch on mainnet.
            </p>
            <p className="tw-font-semibold tw-text-primary tw-bg-gray-2 tw-p-4 tw-rounded-lg">
              Winners of the trading competition will be announced this Friday
              the 25th February, through the official Sovryn channels!
            </p>
            <p className="tw-mt-6 tw-mb-1">Total Prize Pool = $10k in SOV</p>
            <ul className="tw-list-disc tw-ml-4 tw-mb-4">
              <li>
                SOV price based on previous 30 day average on the Sovryn dapp.
              </li>
              <li>$7.5k SOV to be shared among the top three traders.</li>
              <li>$2.5k SOV as a bug bounty or improvement suggestion.</li>
              <li>Prizes vest monthly for a period of 10 months.</li>
            </ul>
            <p>
              Sovryn will distribute prizes directly to the winning wallet
              addresses used during the competition. If you are one of the named
              winners and would prefer that payment be made to a different
              address, please contact us on <a href={discordInvite}>Discord</a>.
              In this event we will authenticate ownership of the winning
              testnet wallets via a specific transaction - so don’t waste your
              time impersonating a winner!
            </p>
            <p>
              Bug bounty / improvement suggestion prize winners will be
              announced at a later date after a thorough analysis of all
              feedback, along with a report on findings and next steps.
            </p>
            <p className="tw-my-8 tw-font-semibold tw-bg-gray-2 tw-p-4 tw-rounded-lg">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                size="2x"
                className="tw-inline-block tw-float-left tw-text-primary tw-my-1 tw-mr-2"
              />
              Under no circumstance will any member of the Sovryn Team ask for
              your personal, wallet, or any other sensitive information. At all
              times, be aware of potential phishing scams and report anyone
              attempting to directly contact you representing themselves as part
              of the Sovryn Team.
            </p>
            <p>
              Follow us and subscribe to our{' '}
              <a href="https://wiki.sovryn.app/en/technical-documents/official-channels">
                official channels
              </a>{' '}
              to stay tuned for more events!
            </p>
            <p className="tw-text-xl tw-font-bold">Stay Sovryn!</p>
          </div>
        </div>
        <div className="tw-relative tw--top-2.5 tw-w-full">
          <PairSelector
            pair={pair}
            collateral={collateral}
            onChange={onChangePair}
          />
          <ContractDetails pair={pair} collateral={collateral} />
        </div>
        <div className={'tw-container tw-mt-5'}>
          <div
            className={
              'tw-flex tw-flex-col tw-mb-8 xl:tw-flex-row xl:tw-justify-stretch tw-space-y-2 xl:tw-space-y-0 xl:tw-space-x-2'
            }
          >
            <DataCard
              className="xl:tw-w-1/5"
              title={`AMM Depth (${pairType.toString()})`}
            >
              <AmmDepthChart pair={pair} />
            </DataCard>
            <DataCard
              title={`Chart (${pairType.toString()})`}
              className={'tw-max-w-full xl:tw-w-3/5 2xl:tw-w-2/5'}
              hasCustomHeight
            >
              <TradingChart
                symbol={pair.chartSymbol}
                theme={Theme.DARK}
                hasCustomDimensions
              />
            </DataCard>
            <DataCard
              className="xl:tw-hidden 2xl:tw-flex xl:tw-w-1/5"
              title={`Recent Trades (${pairType.toString()})`}
            >
              <RecentTradesTable pair={pair} />
            </DataCard>
            <div className="tw-flex tw-flex-col xl:tw-min-w-80 xl:tw-w-1/5 tw-space-y-2">
              <AccountBalanceCard />
              <NewPositionCard />
            </div>
          </div>

          {connected && (
            <>
              <div className="tw-flex tw-items-center tw-text-sm">
                <Tab
                  text={t(translations.perpetualPage.openPositions)}
                  active={activeTab === 0}
                  onClick={() => setActiveTab(0)}
                />
                <Tab
                  text={t(translations.perpetualPage.closedPositions)}
                  active={activeTab === 1}
                  onClick={() => setActiveTab(1)}
                />
                <Tab
                  text={t(translations.perpetualPage.orderHistory)}
                  active={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                />
                <Tab
                  text={t(translations.perpetualPage.fundingPayments)}
                  active={activeTab === 3}
                  onClick={() => setActiveTab(3)}
                />
              </div>

              <div className="tw-w-full tw-mb-24">
                {activeTab === 0 && <OpenPositionsTable perPage={5} />}
                {activeTab === 1 && <ClosedPositionsTable perPage={5} />}
                {activeTab === 2 && <OrderHistoryTable perPage={5} />}
                {activeTab === 3 && <FundingPaymentsTable perPage={5} />}
              </div>
            </>
          )}
        </div>
        <Footer />
        <NotificationSettingsDialog
          isOpen={showNotificationSettingsModal}
          onClose={() => setShowNotificationSettingsModal(false)}
        />
        <AccountDialog />
        <TradeDialog />
        <EditPositionSizeDialog />
        <EditLeverageDialog />
        <EditMarginDialog />
        <ClosePositionDialog />
        <ToastsWatcher />
      </PerpetualQueriesContextProvider>
    </RecentTradesContextProvider>
  );
};
