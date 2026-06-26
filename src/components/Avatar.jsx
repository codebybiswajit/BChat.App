import React, { useState } from 'react';

const Avatar = ({ src, name, size = 'w-8 h-8', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  // Check if src is the known broken default or missing
  const isDefaultOrBroken = !src || src.includes('icon-library.com') || src.includes('ui-avatars.com') || imageError;

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Generate a consistent color based on name string
  const getBackgroundColor = (nameStr) => {
    if (!nameStr) return 'bg-indigo-500';
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 
      'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 
      'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ];
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  if (isDefaultOrBroken) {
    const bgColor = getBackgroundColor(name);
    return (
      <div 
        className={`${size} ${bgColor} text-white rounded-full flex items-center justify-center font-semibold overflow-hidden shrink-0 ${className}`}
        title={name}
      >
        <span style={{ fontSize: '45%' }}>{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={name || "avatar"} 
      onError={() => setImageError(true)}
      className={`${size} rounded-full object-cover shrink-0 ${className}`}
      title={name}
    />
  );
};

export default Avatar;
