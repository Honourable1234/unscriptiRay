export const CreateField = (props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
}) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-center text-sm font-medium text-white">{props.label}</label>
      <input
        type={props.type ?? 'text'}
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
        placeholder={props.label}
        className="h-14 w-full rounded-xl border border-white-25 bg-black-60 px-5 py-4 text-center text-xs text-white outline-none placeholder:text-white-25 focus:border-white-50"
      />
    </div>
  );
};
