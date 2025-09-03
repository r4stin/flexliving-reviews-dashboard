'use client';

import * as Select from '@radix-ui/react-select';
import { ReactNode } from 'react';

export function SelectField({
  label,
  value,
  onValueChange,
  children,
}: {
  label?: string;
  value: string;
  onValueChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="text-sm block">
      {label && <div className="mb-1 text-neutral-600 dark:text-neutral-300">{label}</div>}

      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger
          className="w-full min-h-10 rounded-lg border border-neutral-200 dark:border-neutral-800
                     bg-white dark:bg-neutral-900 px-3 py-2 text-left
                     text-neutral-900 dark:text-neutral-100"
          aria-label={label}
        >
          <Select.Value />
        </Select.Trigger>

        {/* Portal to body so it never gets clipped by parent containers */}
        <Select.Portal>
          <Select.Content
            /* Force below, with a small gap; use popper for robust positioning */
            side="bottom"
            align="start"
            position="popper"
            sideOffset={8}
            avoidCollisions={true}
            className="z-[1000] overflow-hidden rounded-lg border
                       border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 shadow-lg"
          >
            {/* Optional scroll buttons for long lists */}
            <Select.ScrollUpButton className="flex h-6 items-center justify-center text-xs text-neutral-500">
              ↑
            </Select.ScrollUpButton>

            {/* Max height so it never goes off-screen; a bit of padding so the first item isn't flush */}
            <Select.Viewport className="max-h-64 p-1">
              {children}
            </Select.Viewport>

            <Select.ScrollDownButton className="flex h-6 items-center justify-center text-xs text-neutral-500">
              ↓
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </label>
  );
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return (
    <Select.Item
      value={value}
      className="cursor-pointer rounded-md px-2 py-1.5
                 text-neutral-900 dark:text-neutral-100
                 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );
}
