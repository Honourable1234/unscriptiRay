const sizeMap = {
  default: 'w-44 h-43 text-xs',
  hair: 'w-28 h-15 text-xs',
};

type Size = keyof typeof sizeMap;

export const EthnicCard = (props: {
  label: string;
  color?: string;
  size?: Size;
  hideLabel?: boolean;
  onClick?: () => void;
  selected?: boolean;
}) => {
  const size = props.size ?? 'default';
  const bg = props.color ?? '#C4C4C4';

  return (
    <div
      className={`${sizeMap[size]} relative flex cursor-pointer items-end justify-center overflow-hidden rounded-xl transition-all ${props.selected ? 'ring-2 ring-primary-100' : ''}`}
      style={{ backgroundColor: bg }}
      role="button"
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          props.onClick?.();
        }
      }}
    >
      {props.selected && (
        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {!props.hideLabel && <span className="flex h-10 w-full items-center justify-center bg-black/30 font-semibold text-white">{props.label}</span>}
    </div>
  );
};
