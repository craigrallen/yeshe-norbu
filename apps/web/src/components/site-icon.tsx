import React from 'react';

type IconName =
  | 'globe' | 'dharma' | 'calendar' | 'map-pin' | 'leaf' | 'lotus' | 'check'
  | 'dashboard' | 'users' | 'member' | 'events' | 'venue' | 'organizer' | 'settings'
  | 'orders' | 'products' | 'blog' | 'card' | 'phone' | 'lock' | 'mail' | 'bag' | 'book' | 'ticket' | 'box';

export function SiteIcon({ name, className = 'w-4 h-4', stroke = 1.8 }: { name: IconName; className?: string; stroke?: number }) {
  const c = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  const icon = (() => {
    switch (name) {
      case 'globe': return <><circle cx="12" cy="12" r="9" {...c}/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" {...c}/></>;
      case 'dharma': return <><circle cx="12" cy="12" r="8" {...c}/><circle cx="12" cy="12" r="2" {...c}/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" {...c}/></>;
      case 'calendar':
      case 'events': return <><rect x="3" y="5" width="18" height="16" rx="2" {...c}/><path d="M8 3v4M16 3v4M3 10h18" {...c}/></>;
      case 'map-pin':
      case 'venue': return <><path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10z" {...c}/><circle cx="12" cy="11" r="2.5" {...c}/></>;
      case 'leaf': return <><path d="M6 14c0-5 4-8 12-8-1 8-4 12-9 12-2.5 0-3-1.5-3-4z" {...c}/><path d="M7 17c2-3 5-5 9-6" {...c}/></>;
      case 'lotus': return <><path d="M12 19c2.8 0 5-2.2 5-5-2.1.2-3.8 1.4-5 3.3-1.2-1.9-2.9-3.1-5-3.3 0 2.8 2.2 5 5 5z" {...c}/><path d="M12 19v2M8 21h8" {...c}/></>;
      case 'check': return <path d="M5 12l4 4 10-10" {...c}/>;
      case 'dashboard': return <><rect x="3" y="3" width="8" height="8" rx="1.5" {...c}/><rect x="13" y="3" width="8" height="5" rx="1.5" {...c}/><rect x="13" y="10" width="8" height="11" rx="1.5" {...c}/><rect x="3" y="13" width="8" height="8" rx="1.5" {...c}/></>;
      case 'users': return <><circle cx="9" cy="8" r="3" {...c}/><circle cx="17" cy="9" r="2.5" {...c}/><path d="M3 19c.8-3 3-5 6-5s5.2 2 6 5M14 19c.4-1.8 1.6-3.2 3.5-3.8" {...c}/></>;
      case 'member': return <><rect x="3" y="5" width="18" height="14" rx="2" {...c}/><circle cx="8" cy="12" r="2" {...c}/><path d="M12 10h6M12 14h6" {...c}/></>;
      case 'organizer': return <><circle cx="12" cy="8" r="3" {...c}/><path d="M4 20c1.5-4 4-6 8-6s6.5 2 8 6" {...c}/></>;
      case 'settings': return <><circle cx="12" cy="12" r="3" {...c}/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3.8a7 7 0 0 0-1.7-1L14.5 3h-5L9 5.8a7 7 0 0 0-1.7 1L5 6 3 9.5 5 11a7 7 0 0 0 0 2l-2 1.5L5 18l2.3-.8a7 7 0 0 0 1.7 1l.5 2.8h5l.5-2.8a7 7 0 0 0 1.7-1L19 18l2-3.5-2-1.5c.1-.3.1-.7.1-1z" {...c}/></>;
      case 'orders':
      case 'bag': return <><path d="M4 7h16l-1.2 11H5.2L4 7z" {...c}/><path d="M9 7a3 3 0 0 1 6 0" {...c}/></>;
      case 'products':
      case 'box': return <><path d="M3 7l9-4 9 4-9 4-9-4z" {...c}/><path d="M3 7v10l9 4 9-4V7" {...c}/></>;
      case 'blog': return <><path d="M4 20h4l10-10-4-4L4 16v4z" {...c}/><path d="M12 6l4 4" {...c}/></>;
      case 'card': return <><rect x="3" y="6" width="18" height="12" rx="2" {...c}/><path d="M3 10h18" {...c}/></>;
      case 'phone': return <><rect x="8" y="3" width="8" height="18" rx="2" {...c}/><path d="M11 18h2" {...c}/></>;
      case 'lock': return <><rect x="5" y="11" width="14" height="10" rx="2" {...c}/><path d="M8 11V8a4 4 0 1 1 8 0v3" {...c}/></>;
      case 'mail': return <><rect x="3" y="5" width="18" height="14" rx="2" {...c}/><path d="M3 7l9 7 9-7" {...c}/></>;
      case 'book': return <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5z" {...c}/><path d="M8 7h8" {...c}/></>;
      case 'ticket': return <><path d="M3 9a2 2 0 0 0 0 4v2h18v-2a2 2 0 0 0 0-4V7H3v2z" {...c}/><path d="M12 7v8" {...c}/></>;
      default: return <circle cx="12" cy="12" r="8" {...c}/>;
    }
  })();

  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{icon}</svg>;
}
