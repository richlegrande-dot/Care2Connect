import React from "react";

type Profile = {
  id?: string;
  name?: string;
  bio?: string | null;
  skills?: string[];
  urgentNeeds?: string[];
  longTermGoals?: string[];
  donationPitch?: string | null;
  cashtag?: string | null;
  qrCodeUrl?: string | null;
  viewCount?: number;
  user?: { location?: string | null };
};

export function ProfileCard({ profile }: { profile?: Profile }) {
  if (!profile) return <div />;
  const bioText = profile.bio
    ? String(profile.bio).replace(/\s+/g, " ").trim()
    : "";

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h2>{profile.name}</h2>
      <p className="line-clamp-3">{bioText}</p>

      <div>
        {(profile.skills || []).map((s, i) => (
          <span
            key={i}
            data-testid={`skill-tag-${i}`}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="text-gray-500 text-sm">
        {profile.viewCount ?? 0} views
      </div>

      <div>
        <h3>Immediate Needs</h3>
        {(profile.urgentNeeds || []).map((n, i) => (
          <div key={i}>{n}</div>
        ))}
      </div>

      <div>
        <h3>Goals</h3>
        {(profile.longTermGoals || []).map((g, i) => (
          <div key={i}>{g}</div>
        ))}
      </div>

      {profile.donationPitch && <div>{profile.donationPitch}</div>}
      {profile.cashtag && <div>{profile.cashtag}</div>}

      {profile.qrCodeUrl && (
        <img alt="Cash App QR Code" src={profile.qrCodeUrl} />
      )}

      <div>Member since</div>
      <div>{profile.user?.location}</div>
    </div>
  );
}

export default ProfileCard;
