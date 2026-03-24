export const Button = (props: {
  text: string;
  onClick?: () => void;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) => {
  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      className={`cursor-pointer rounded-lg border px-6 py-2 text-sm font-semibold transition-opacity hover:opacity-80 ${props.className ?? ''}`}
    >
      {props.text}
    </button>
  );
};
