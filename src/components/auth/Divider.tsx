export const Divider = (props: { text: string }) => {
  return (
    <div className="flex items-center gap-2.75">
      <hr className="flex-1 border-white-75" />
      <p className="text-xs font-medium text-white-75">{props.text}</p>
      <hr className="flex-1 border-white-75" />
    </div>
  );
};
