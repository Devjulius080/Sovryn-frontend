import React, { useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { TransitionStep } from '../../../../../containers/TransitionSteps';
import { actions } from '../../../slice';
import { PerpetualPageModals } from '../../../types';
import { TradeForm } from '../../TradeForm';
import { ClosePositionDialogStep } from '../types';
import { ClosePositionDialogContext } from '..';

export const TradeFormStep: TransitionStep<ClosePositionDialogStep> = ({
  changeTo,
}) => {
  const dispatch = useDispatch();
  const { changedTrade, onChange } = useContext(ClosePositionDialogContext);

  const onOpenSlippage = useCallback(
    () => changeTo(ClosePositionDialogStep.slippage),
    [changeTo],
  );

  const onSubmit = useCallback(
    () =>
      // TODO: implement review and excecution for ClosePositionDialog
      dispatch(
        actions.setModal(PerpetualPageModals.TRADE_REVIEW, changedTrade),
      ),
    [dispatch, changedTrade],
  );

  if (!changedTrade) {
    return null;
  }

  return (
    <div className="tw-mw-340 tw-h-full tw-mx-auto">
      <TradeForm
        trade={changedTrade}
        onOpenSlippage={onOpenSlippage}
        onSubmit={onSubmit}
        onChange={onChange}
      />
    </div>
  );
};
