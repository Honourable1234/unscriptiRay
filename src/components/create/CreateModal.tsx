import { ModalCloseButton } from './ModalCloseButton';

export const CreateModal = (props: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={props.onClose}
    >
      <div
        role="presentation"
        className="h-166 w-full max-w-120.5 rounded-2xl border border-white-25 bg-black-80 p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="text-lg font-semibold text-white">{props.title}</span>
          <ModalCloseButton onClick={props.onClose} />
        </div>
        <hr className="mb-6 border border-black-40" />
        {props.children}
      </div>
    </div>
  );
};
