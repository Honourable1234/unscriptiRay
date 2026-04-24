import { PlayIcon } from '@/components/icons';

export const CharacterInfoCard = (props: {
  title: string;
  value?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`m-auto flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-4 ${props.value ? 'border-primary-100' : 'border-white-25'}`}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          props.onClick?.();
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs text-white">{props.title}</span>
        <span className={`text-sm font-medium ${props.value ? 'text-white' : 'text-white-25'}`}>
          {props.value || `Select ${props.title}`}
        </span>
      </div>
      {props.value && (
        <button type="button">
          {props.icon ?? <PlayIcon color={props.iconColor} />}
        </button>
      )}
    </div>
  );
};
