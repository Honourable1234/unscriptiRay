'use client';

import { SelectStarIcon, VisualIcon } from '@/components/icons';
import { GenerateOptionCard } from './GenerateOptionCard';

export const EditStyle = (props: {
  imageName: string | null;
  isUploading: boolean;
  visualName: string | null;
  onImageClick: () => void;
  onImageClear: () => void;
  onVisualClick: () => void;
  onVisualClear: () => void;
}) => {
  return (
    <div className="mx-auto flex w-full max-w-184 flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <GenerateOptionCard
          label={props.isUploading ? 'Uploading...' : 'Image'}
          sublabel="Required"
          height="223px"
          icon={<SelectStarIcon />}
          isSelected={!!props.imageName}
          selectedName={props.imageName ?? undefined}
          onClick={props.onImageClick}
          onDeselect={props.onImageClear}
        />
        <GenerateOptionCard
          label="Visual"
          sublabel="Required"
          height="223px"
          icon={<VisualIcon />}
          isSelected={!!props.visualName}
          selectedName={props.visualName ?? undefined}
          onClick={props.onVisualClick}
          onDeselect={props.onVisualClear}
        />
      </div>
    </div>
  );
};
