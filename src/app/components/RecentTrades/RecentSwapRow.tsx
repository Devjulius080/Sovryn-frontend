import classNames from 'classnames';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Tooltip } from '@blueprintjs/core/lib/esm/components';
import { AssetDetails } from 'utils/models/asset-details';
import { Conversion } from 'utils/graphql/rsk/generated';

type RecentSwapRowProps = {
  row: Conversion;
  isOddRow: boolean;
  baseAssetDetails: AssetDetails;
  quoteAssetDetails: AssetDetails;
};

export const RecentSwapRow: React.FC<RecentSwapRowProps> = ({
  row,
  isOddRow,
  baseAssetDetails,
  quoteAssetDetails,
}) => {
  const backgroundClassName = useMemo(
    () => (isOddRow ? 'tw-bg-gray-3' : 'tw-bg-gray-1'),
    [isOddRow],
  );
  const isBuy = useMemo(
    () =>
      row._fromToken.id.toLowerCase() ===
      baseAssetDetails.getTokenContractAddress().toLowerCase(),
    [baseAssetDetails, row._fromToken.id],
  );

  const size = useMemo(() => (isBuy ? row._amount : row._return), [
    isBuy,
    row._amount,
    row._return,
  ]);

  const price = useMemo(
    () =>
      isBuy
        ? Number(row._return) / Number(row._amount)
        : Number(row._amount) / Number(row._return),
    [isBuy, row._amount, row._return],
  );

  return (
    <tr
      key={row.transaction.id}
      className={classNames(
        'tw-h-6',
        isBuy ? 'tw-text-trade-long' : 'tw-text-trade-short',
      )}
    >
      <td
        className={classNames(
          'tw-pl-4 tw-py-1 tw-text-left tw-font-semibold tw-rounded-l tw-whitespace-nowrap',
          backgroundClassName,
        )}
      >
        <Tooltip position="top" interactionKind="hover" content={<>{price}</>}>
          {Number(price).toFixed(quoteAssetDetails.displayDecimals)}
        </Tooltip>
      </td>
      <td
        className={classNames(
          'tw-pl-2 tw-py-1 tw-text-right',
          backgroundClassName,
        )}
      >
        <Tooltip position="top" interactionKind="hover" content={<>{size}</>}>
          {Number(size).toFixed(baseAssetDetails.displayDecimals)}
        </Tooltip>
      </td>
      <td
        className={classNames(
          'tw-px-4 tw-pt-1 tw-text-right tw-text-tiny',
          backgroundClassName,
        )}
      >
        {dayjs(Number(row.timestamp) * 1e3)
          .utc()
          .format('YY/MM/DD HH:mm')}
      </td>
    </tr>
  );
};
