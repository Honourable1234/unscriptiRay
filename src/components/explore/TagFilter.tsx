'use client';

export const TagFilter = (props: { tags: string[]; selected: string[]; onChange: (tags: string[]) => void }) => {
  const toggle = (tag: string) => {
    if (tag === 'All') {
      props.onChange(['All']);
      return;
    }
    const without = props.selected.filter(t => t !== 'All');
    const next = without.includes(tag)
      ? without.filter(t => t !== tag)
      : [...without, tag];
    props.onChange(next.length === 0 ? ['All'] : next);
  };

  return (
    <div className="flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {props.tags.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`rounded-xl px-6 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
            props.selected.includes(tag)
              ? 'bg-primary-100 text-white'
              : 'text-white-75 hover:text-white'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
