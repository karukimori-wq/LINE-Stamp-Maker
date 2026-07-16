import type { ButtonHTMLAttributes } from 'react';

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`min-h-12 w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white shadow-sm transition active:scale-[.99] disabled:opacity-50 ${props.className ?? ''}`} />;
}
