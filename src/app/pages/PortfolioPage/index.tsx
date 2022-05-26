import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { SkeletonRow } from 'app/components/Skeleton/SkeletonRow';
import { SovGenerationNFTS } from 'app/components/SovGenerationNFTS';
import { UserAssets } from 'app/components/UserAssets';
import { VestedAssets } from 'app/components/UserAssets/components/VestedAssets';
import { useAccount, useIsConnected } from 'app/hooks/useAccount';
import { TopUpHistory } from './components/TopUpHistory';
import { VestedHistory } from 'app/containers/VestedHistory';
import { OriginClaimBanner } from './components/OriginClaimBanner';
import { Button, ButtonStyle } from 'app/components/Button';
import { Tabs } from 'app/components/Tabs';

export const PortfolioPage: React.FC = () => {
  const { t } = useTranslation();
  const connected = useIsConnected();
  const account = useAccount();

  const historyTabs = [
    {
      id: 'topUpHistory',
      label: t(translations.topUpHistory.meta.title),
      content: <TopUpHistory />,
    },
    {
      id: 'vestedHistory',
      label: t(translations.vestedHistory.title),
      content: <VestedHistory />,
    },
  ];

  const portfolioTabs = [
    {
      id: 'userAssets',
      label: t(translations.portfolioPage.tabs.userAssets),
      content: <UserAssets />,
    },
    {
      id: 'vestedAssets',
      label: t(translations.portfolioPage.tabs.vestedAssets),
      content: <VestedAssets />,
    },
    {
      id: 'userNFTS',
      label: t(translations.portfolioPage.tabs.userNFTS),
      content: <SovGenerationNFTS />,
    },
  ];
  return (
    <>
      <Helmet>
        <title>{t(translations.portfolioPage.meta.title)}</title>
        <meta
          name="description"
          content={t(translations.portfolioPage.meta.description)}
        />
      </Helmet>

      <div className="tw-container tw-mx-auto tw-flex tw-mt-10 xl:tw-max-w-4/6">
        <Button
          text={t(translations.portfolioPage.portfolio)}
          style={ButtonStyle.link}
          className="tw-text-2xl tw-text-sov-white hover:tw-no-underline focus:tw-no-underline"
        />
        <Button
          text={t(translations.portfolioPage.rewards)}
          style={ButtonStyle.link}
          className="tw-ml-10 tw-text-2xl tw-text-gray-6 hover:tw-text-sov-white hover:tw-no-underline focus:tw-no-underline"
          href="/reward"
        />
      </div>

      <div className="tw-container tw-mx-auto tw-flex tw-mt-4 xl:tw-max-w-4/6">
        <OriginClaimBanner />
      </div>

      <div className="tw-container tw-mx-auto tw-px-4 tw-max-w-6xl ">
        <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-mb-3">
          <h2 className="tw-flex-shrink-0 tw-flex-grow-0 tw-mb-2 ">
            {t(translations.userAssets.meta.title)}
          </h2>
        </div>
        {connected && account ? (
          <Tabs
            items={portfolioTabs}
            initial={portfolioTabs[0].id}
            contentClassName="tw-col-span-12 tw-mt-2"
            dataActionId="portfolio-assets"
          />
        ) : (
          <div className="tw-grid tw-gap-8 tw-grid-cols-12">
            <div className="tw-col-span-12">
              <SkeletonRow
                loadingText={t(translations.topUpHistory.walletHistory)}
                className="tw-mt-2"
              />
            </div>
          </div>
        )}
      </div>
      {connected && account && (
        <Tabs
          items={historyTabs}
          initial={historyTabs[0].id}
          className="tw-container tw-mt-12"
          contentClassName="tw-overflow-auto"
          dataActionId="portfolio-history"
        />
      )}
    </>
  );
};