// Simple, elegant line icons per category slug — no emoji, matches the soft
// premium visual language. Falls back to a generic gift icon for any
// category not in this map, so new categories added from the admin panel
// never break the homepage.

const PASTELS = ['bg-blush', 'bg-peach', 'bg-sand', 'bg-rose-light/60', 'bg-sage'];

export function categoryPastel(index: number) {
  return PASTELS[index % PASTELS.length];
}

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function FlowerIcon() {
  return (
    <IconWrap>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 3.5c1.6 0 2.6 1.3 2.2 2.8-.3 1.1-1.1 1.9-2.2 2.2-1.1-.3-1.9-1.1-2.2-2.2C9.4 4.8 10.4 3.5 12 3.5z" />
      <path d="M12 20.5c1.6 0 2.6-1.3 2.2-2.8-.3-1.1-1.1-1.9-2.2-2.2-1.1.3-1.9 1.1-2.2 2.2-.4 1.5.6 2.8 2.2 2.8z" />
      <path d="M20.5 12c0 1.6-1.3 2.6-2.8 2.2-1.1-.3-1.9-1.1-2.2-2.2.3-1.1 1.1-1.9 2.2-2.2 1.5-.4 2.8.6 2.8 2.2z" />
      <path d="M3.5 12c0-1.6 1.3-2.6 2.8-2.2 1.1.3 1.9 1.1 2.2 2.2-.3 1.1-1.1 1.9-2.2 2.2-1.5.4-2.8-.6-2.8-2.2z" />
    </IconWrap>
  );
}

function GiftBoxIcon() {
  return (
    <IconWrap>
      <rect x="3.5" y="9.5" width="17" height="10" rx="1.4" />
      <path d="M3.5 9.5h17M12 9.5v10" />
      <path d="M8.2 9.5c-1.7 0-2.7-1.3-2.4-2.7C6.1 5.3 7.5 4.3 9 5c1.6.7 2.4 2.2 3 4.5-1.6 0-3.1 0-3.8 0z" />
      <path d="M15.8 9.5c1.7 0 2.7-1.3 2.4-2.7-.3-1.5-1.7-2.5-3.2-1.8-1.6.7-2.4 2.2-3 4.5 1.6 0 3.1 0 3.8 0z" />
    </IconWrap>
  );
}

function ChocolateIcon() {
  return (
    <IconWrap>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M3.5 9.2h17M3.5 14.8h17M9 5.5v13M15 5.5v13" />
    </IconWrap>
  );
}

function TeddyBearIcon() {
  return (
    <IconWrap>
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="12" cy="13" r="6" />
      <circle cx="9.6" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.4" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <path d="M10.3 15c.6.6 2.8.6 3.4 0" />
    </IconWrap>
  );
}

function LuxuryIcon() {
  return (
    <IconWrap>
      <path d="M4 8l4-3.5L12 8l4-3.5L20 8l-2 9H6L4 8z" />
      <path d="M4 8l3.2 2M20 8l-3.2 2M12 8l0 2" />
    </IconWrap>
  );
}

function SeasonalIcon() {
  return (
    <IconWrap>
      <path d="M12 2.5c2 2.6 3.2 5 3.2 7.3a3.2 3.2 0 11-6.4 0c0-2.3 1.2-4.7 3.2-7.3z" />
      <path d="M8.5 21.5h7M12 15.5v6" />
    </IconWrap>
  );
}

function GenericGiftIcon() {
  return <GiftBoxIcon />;
}

const ICONS: Record<string, () => React.ReactElement> = {
  ward: FlowerIcon,
  'gift-boxes': GiftBoxIcon,
  chocolate: ChocolateIcon,
  'teddy-bears': TeddyBearIcon,
  'flowers-and-gift': FlowerIcon,
  'luxury-gifts': LuxuryIcon,
  'seasonal-gifts': SeasonalIcon,
};

export function CategoryIcon({ slug }: { slug: string }) {
  const Icon = ICONS[slug] ?? GenericGiftIcon;
  return <Icon />;
}
