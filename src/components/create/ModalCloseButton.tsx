import { CloseIcon } from '@/components/icons';

export const ModalCloseButton = (props: { onClick: () => void }) => (
  <button type="button" onClick={props.onClick} className="text-white-50 hover:text-white">
    <CloseIcon />
  </button>
);
