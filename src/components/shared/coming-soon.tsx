export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-1 px-8 text-center">
      <p className="text-[13px] text-ink-mute">{label}</p>
      <p className="text-[12px] text-ink-faint">This screen is being built in a later phase.</p>
    </div>
  );
}
