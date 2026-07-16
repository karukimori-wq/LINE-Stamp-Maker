export function AppHeader({ title = 'LINE Stamp Maker', subtitle = 'あなたのスタンプをつくろう' }: { title?: string; subtitle?: string }) {
  return <header className="flex items-center gap-3 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-2xl">🐱</div><div><h1 className="font-bold">{title}</h1><p className="text-xs text-zinc-500">{subtitle}</p></div></header>;
}
