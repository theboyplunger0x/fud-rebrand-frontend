import { useEffect, useState } from "react";

import { backendAvatarUrl } from "@/lib/api";
import { getPublicProfile, profileInitials } from "@/lib/profiles";

const avatarColors = ["#3138ff", "#e34f90", "#0d9488", "#ca8a04", "#7c3aed", "#ea580c"];

function avatarColor(username: string) {
  const total = [...username].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return avatarColors[total % avatarColors.length];
}

export function ProfileAvatar({
  username,
  avatarUrl,
  size = 36,
  className = "",
}: {
  username: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const profile = getPublicProfile(username);
  const source = avatarUrl || profile?.avatar || backendAvatarUrl(username);
  const [failedSource, setFailedSource] = useState<string | null>(null);

  useEffect(() => {
    setFailedSource(null);
  }, [source]);

  if (source && failedSource !== source) {
    return (
      <img
        src={source}
        alt={`${profile?.displayName ?? username} profile`}
        onError={() => setFailedSource(source)}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${className}`}
      style={{ width: size, height: size, backgroundColor: avatarColor(username) }}
      aria-label={`${username} profile`}
    >
      {profileInitials(username)}
    </span>
  );
}
