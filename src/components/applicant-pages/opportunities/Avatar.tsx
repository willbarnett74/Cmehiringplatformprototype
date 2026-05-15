import { hashCompanyTone, companyInitials } from './messengerUtils';

export function Avatar({
  companyName,
  size = 42,
  online,
  className = '',
}: {
  companyName: string;
  size?: number;
  online?: boolean;
  className?: string;
}) {
  const tone = hashCompanyTone(companyName);
  const initials = companyInitials(companyName);
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-full font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        background: tone.bg,
        color: tone.fg,
        fontSize: size * 0.33,
      }}
      aria-hidden
    >
      {initials}
      {online ? (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#7dbbff]"
          style={{ width: 10, height: 10, marginRight: -1, marginBottom: -1 }}
          aria-label="Online"
        />
      ) : null}
    </div>
  );
}
