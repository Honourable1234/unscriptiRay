export const BouncingDots = () => (
  <span className="flex items-center gap-1">
    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
  </span>
);
