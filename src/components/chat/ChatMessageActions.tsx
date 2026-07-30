'use client';

import { Copy, MoreHorizontal } from 'lucide-react';
import { EditIcon, RemixIcon, TrashIcon } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ChatMessageActions = (props: {
  onCopy: () => void;

  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="flex items-center gap-3 text-white-75">
      <button type="button" aria-label="Copy message" onClick={props.onCopy} className="cursor-pointer hover:text-white [&>svg]:size-4">
        <Copy />
      </button>
      <button type="button" aria-label="Edit message" onClick={props.onEdit} className="cursor-pointer hover:text-white [&>svg]:size-4">
        <EditIcon />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="More actions" className="cursor-pointer hover:text-white">
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={props.onDuplicate} className="gap-3 py-1.5 [&_svg]:size-4">
            <RemixIcon />
            Duplicate from here
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={props.onDelete} className="gap-3 py-1.5 [&_svg]:size-4">
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
