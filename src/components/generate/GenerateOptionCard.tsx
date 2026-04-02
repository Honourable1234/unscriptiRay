'use client';

export const GenerateOptionCard = (props: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  width?: string;
  height?: string;
}) => {
  return (
    <button
      onClick={props.onClick}
      style={{ width: props.width, height: props.height }}
      className="m-auto flex h-56 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-white-25 bg-black-100 transition-colors hover:border-primary-100"
    >
      <span className="text-white-75">{props.icon}</span>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-white">{props.label}</span>
        <span className="text-xs text-white-75">{props.sublabel}</span>
      </div>
    </button>
  );
};
