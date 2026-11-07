import { profile } from '@/content';
import { LocalTime } from './LocalTime';

export function IdentityBlock() {
  return (
    <div className="min-w-0">
      <p className="leading-tight font-semibold text-ink">{profile.fullName}</p>
      <p className="mt-0.5 text-sm leading-snug text-ink-muted">
        {profile.role} · path to {profile.goal}
      </p>
      <div className="mt-2">
        <LocalTime timeZone="Asia/Manila" place={profile.location} />
      </div>
    </div>
  );
}
