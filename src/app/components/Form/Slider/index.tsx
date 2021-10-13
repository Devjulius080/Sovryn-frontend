import React from 'react';
import { Slider as BPSlider } from '@blueprintjs/core/lib/esm/components/slider/slider';
import cn from 'classnames';
import styles from './index.module.scss';

type LabelRendererFn = (value: number, opts?) => string | JSX.Element;

export enum SliderType {
  primary = 'primary',
  secondary = 'secondary',
  gradient = 'gradient',
}

type ISliderProps = {
  value: number;
  onChange?: (value: number) => void;
  onRelease?: (value: number) => void;
  min?: number;
  max?: number;
  stepSize?: number;
  labelStepSize?: number;
  labelRenderer?: boolean | LabelRendererFn;
  className?: string;
  labelValues?: number[];
  dataActionId?: string;
  type?: SliderType;
};

export const Slider: React.FC<ISliderProps> = ({
  className,
  type = SliderType.secondary,
  ...props
}) => (
  <div
    className={cn(styles.host, styles[type], className)}
    data-action-id={props.dataActionId}
  >
    <BPSlider {...props} />
  </div>
);
