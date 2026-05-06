import Image from 'next/image';

export const CreateStyleCard = (props: { style: string; onClick?: () => void; selected?: boolean }) => {
  return (
    <div
      className={`relative h-69 cursor-pointer overflow-hidden rounded-2xl transition-all ${props.selected ? 'ring-2 ring-primary-100' : ''}`}
      role="button"
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          props.onClick?.();
        }
      }}
    >
      <Image
        src={`/Create/${props.style}.png`}
        alt={props.style}
        fill
        sizes="200px"
        className="object-cover object-[center_25%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {props.selected && (
        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className="absolute right-0 bottom-0 left-0 p-2.5 text-center">
        <span className="text-sm font-semibold text-white">{props.style}</span>
      </div>
    </div>
  );
};
