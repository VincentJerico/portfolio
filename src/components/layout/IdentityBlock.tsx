import Image from 'next/image';
import { identity } from '@/lib/identity';

export function IdentityBlock() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={identity.photo}
        alt="Vincent Jerico Alcuran"
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-full border border-line object-cover object-[50%_35%]"
      />
      <div className="min-w-0">
        <p className="font-semibold leading-tight text-ink">{identity.fullName}</p>
        <p className="mt-0.5 text-sm leading-snug text-ink-muted">{identity.roleLine}</p>
      </div>
    </div>
  );
}
