import Image from 'next/image';
import { profile } from '@/content';

export function IdentityBlock() {
  return (
    <div className="flex items-center gap-3">
      {profile.photo && (
        <Image
          src={profile.photo}
          alt={profile.fullName}
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full border border-line object-cover object-[50%_35%]"
        />
      )}
      <div className="min-w-0">
        <p className="leading-tight font-semibold text-ink">{profile.fullName}</p>
        <p className="mt-0.5 text-sm leading-snug text-ink-muted">
          {profile.role} · path to {profile.goal}
        </p>
      </div>
    </div>
  );
}
