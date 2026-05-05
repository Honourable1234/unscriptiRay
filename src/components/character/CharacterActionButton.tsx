export const CharacterActionButton = (props: {
  text: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <button
    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold whitespace-nowrap text-white ${props.className ?? ''}`}
    onClick={props.onClick}
  >
    {props.icon}
    {props.text}
  </button>
);
