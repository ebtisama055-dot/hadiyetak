// Lightweight, dependency-free icon set for the platforms admins can add
// under "روابط التواصل الاجتماعي". Unknown platform names fall back to a
// simple globe/link glyph so a new entry never breaks the footer's layout.

function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 22v-8.4h2.8l.4-3.3h-3.2V8.2c0-.96.27-1.6 1.65-1.6h1.76V3.66C16.6 3.6 15.6 3.5 14.4 3.5c-2.5 0-4.2 1.53-4.2 4.34v2.46H7.4v3.3h2.8V22h3.3z" />
    </svg>
  );
}
function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.1" cy="6.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M14.6 2h2.6c.16 1.5 1 2.95 2.5 3.7.6.3 1.25.47 1.9.5v2.7a6.9 6.9 0 0 1-3.9-1.2v6.6a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6.02.9.07v2.75a3 3 0 1 0 2.1 2.86V2z" />
    </svg>
  );
}
function Twitter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 3H21l-6.6 7.55L22.3 21h-6.3l-4.9-6.4L5.4 21H3.3l7.05-8.07L2.7 3h6.45l4.4 5.85L18.9 3zm-1.1 16.2h1.15L7.3 4.7H6.06l11.74 14.5z" />
    </svg>
  );
}
function Snapchat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5c2.9 0 4.9 2.2 4.9 5.1 0 1 .05 1.85.13 2.55.55.25 1.1.15 1.55-.05.35-.15.8-.1.95.3.15.4-.05.75-.4.95-.35.2-.85.4-1.35.55.1.35.5.9 1.5 1.3.3.12.5.45.4.8-.15.5-1 .7-1.7.8-.05.2-.1.5-.2.75-.1.25-.35.35-.6.3-.5-.1-1.05-.1-1.5.15-.55.3-1.15.9-2.15.9h-.1c-1 0-1.6-.6-2.15-.9-.45-.25-1-.25-1.5-.15-.25.05-.5-.05-.6-.3-.1-.25-.15-.55-.2-.75-.7-.1-1.55-.3-1.7-.8-.1-.35.1-.68.4-.8 1-.4 1.4-.95 1.5-1.3-.5-.15-1-.35-1.35-.55-.35-.2-.55-.55-.4-.95.15-.4.6-.45.95-.3.45.2 1 .3 1.55.05.08-.7.13-1.55.13-2.55 0-2.9 2-5.1 4.9-5.1z" />
    </svg>
  );
}
function Youtube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.2 27.9 27.9 0 0 0 2 12a27.9 27.9 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.3-1.6.4-3.2.4-4.8a27.9 27.9 0 0 0-.4-4.8zM10 15V9l5.2 3-5.2 3z" />
    </svg>
  );
}
function LinkGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17" strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<string, (props: { className?: string }) => JSX.Element> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: TikTok,
  twitter: Twitter,
  x: Twitter,
  snapchat: Snapchat,
  youtube: Youtube,
};

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = ICONS[platform.trim().toLowerCase()] ?? LinkGlyph;
  return <Icon className={className} />;
}
