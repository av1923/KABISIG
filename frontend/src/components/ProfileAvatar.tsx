import React from 'react';

interface ProfileAvatarProps {
  name?: string;
  src?: string;
  className?: string;
  alt?: string;
}

function getInitials(name = 'User') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

export default function ProfileAvatar({ name, src, className = 'h-10 w-10', alt }: ProfileAvatarProps) {
  if (src) {
    return <img src={src} alt={alt || `${name || 'User'} profile`} className={`${className} object-cover`} />;
  }

  return (
    <div
      role="img"
      aria-label={alt || `${name || 'User'} profile placeholder`}
      className={`${className} flex items-center justify-center bg-[#091d64] font-extrabold text-white`}
    >
      {getInitials(name)}
    </div>
  );
}
