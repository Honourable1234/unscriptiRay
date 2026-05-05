'use client';

import { SelectStarIcon } from '@/components/icons';
import { GenerateOptionCard } from './GenerateOptionCard';

export const EditStyle = (props: {
  imageSelected: boolean;
  visualSelected: boolean;
  onImageClick: () => void;
  onVisualClick: () => void;
}) => {
  return (
    <div className="mx-auto flex w-full max-w-184 flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <GenerateOptionCard
          label="Image"
          sublabel="Required"
          height="223px"
          icon={<SelectStarIcon />}
          isSelected={props.imageSelected}
          onClick={props.onImageClick}
        />
        <GenerateOptionCard
          label="Visual"
          sublabel="Required"
          height="223px"
          icon={<SelectStarIcon />}
          isSelected={props.visualSelected}
          onClick={props.onVisualClick}
        />
      </div>

      <div></div>

    </div>
  );
};
