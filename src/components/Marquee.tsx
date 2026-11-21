export function Marquee({ items }: { items: string[] }) {
  const group = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="pr-8 font-head text-[17px] font-bold tracking-[-0.01em] whitespace-nowrap uppercase sm:text-[22px]">
      {items.map((item) => (
        <span key={item}>
          {item}
          <b className="mx-[22px] text-navy" aria-hidden>✱</b>
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden bg-brand py-[18px] text-white">
      <div className="flex w-max animate-marquee">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
