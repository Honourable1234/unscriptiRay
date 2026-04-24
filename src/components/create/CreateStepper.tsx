'use client';

import { AllIcon, CreateStep1Icon, CreateStep2Icon, DashIcon, PictureIcon } from '@/components/icons';

const icons = [
  <CreateStep1Icon key="1" />,
  <CreateStep2Icon key="2" />,
  <AllIcon key="3" />,
  <PictureIcon key="4" />,
];

export const CreateStepper = (props: { step: number }) => {
  const items: React.ReactNode[] = [];

  icons.forEach((icon, i) => {
    const num = i + 1;
    const active = num <= props.step;
    items.push(
      <span key={`icon-${num}`} className={`transition-colors duration-200 [&>svg]:h-4 [&>svg]:w-4 ${active ? 'text-primary-100' : 'text-white-25'}`}>
        {icon}
      </span>,
    );
    if (i < icons.length - 1) {
      items.push(
        <span key={`dash-${num}`} className={`transition-colors duration-200 [&>svg]:h-4 [&>svg]:w-8 ${num < props.step ? 'text-primary-100' : 'text-white-25'}`}>
          <DashIcon />
        </span>,
      );
    }
  });

  return (
    <div className="flex items-center justify-center gap-2">
      {items}
    </div>
  );
};
