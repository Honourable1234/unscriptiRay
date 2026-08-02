'use client';

import { useTranslations } from 'next-intl';
import { SelectStarIcon } from '@/components/icons';
import { ImageFrameIcon } from '@/components/icons/ImageFramIcon';
import { GenerateOptionCard } from './GenerateOptionCard';

export const EditStyle = (props: {
  imageUrl: string | null;
  starName: string | null;
  starImage?: string;
  onStarClick: () => void;
  onStarClear: () => void;
  onImageClick: () => void;
  onImageClear: () => void;
}) => {
  const t = useTranslations('EditStyle');

  return (
    <div className="mx-auto flex w-full max-w-184 flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <GenerateOptionCard
          label={t('select_star')}
          sublabel={t('required')}
          height="223px"
          icon={<SelectStarIcon />}
          isSelected={!!props.starName}
          selectedImage={props.starImage}
          selectedName={props.starName ?? undefined}
          onClick={props.onStarClick}
          onDeselect={props.onStarClear}
        />
        <GenerateOptionCard
          label={t('image')}
          sublabel={t('required')}
          height="223px"
          icon={<ImageFrameIcon />}
          isSelected={!!props.imageUrl}
          selectedImage={props.imageUrl ?? undefined}
          selectedName={t('select_image')}
          onClick={props.onImageClick}
          onDeselect={props.onImageClear}
        />
      </div>
    </div>
  );
};
