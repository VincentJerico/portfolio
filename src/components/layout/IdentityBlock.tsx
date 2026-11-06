import { profile } from '@/content';

export function IdentityBlock() {
  return (
    <div className="min-w-0">
      <p className="leading-tight font-semibold text-ink">{profile.fullName}</p>
      <p className="mt-0.5 text-sm leading-snug text-ink-muted">
        {profile.role} · path to {profile.goal}
      </p>
    </div>
  );
}
