export function EasyPayLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#111111" />
      <path d="M12 11L8 16L12 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 11L24 16L20 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OnboardingIllustration() {
  return (
    <svg width="280" height="240" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Soft Bubble */}
      <circle cx="140" cy="120" r="100" fill="#F8F6F2" />
      
      {/* Top Character on phone */}
      <g transform="translate(100, 20)">
        <circle cx="40" cy="20" r="12" fill="#111111" />
        <path d="M35 15C35 15 45 15 45 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M25 45C25 32 55 32 55 45L60 70H20L25 45Z" fill="#111111" />
        <rect x="52" y="38" width="10" height="18" rx="2" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
      </g>

      {/* Seated Left Character */}
      <g transform="translate(30, 80)">
        <circle cx="45" cy="25" r="14" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />
        {/* Beard & Hair */}
        <path d="M36 22C36 15 54 15 54 22C54 28 50 32 45 32C40 32 36 28 36 22Z" fill="#111111" />
        {/* Torso */}
        <path d="M25 60C25 42 65 42 65 60L60 110H30L25 60Z" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />
        {/* Arms holding phone */}
        <path d="M30 65L50 78L60 65" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
        <rect x="46" y="70" width="14" height="20" rx="3" fill="#111111" />
      </g>

      {/* Seated Right Character */}
      <g transform="translate(150, 80)">
        <circle cx="45" cy="25" r="14" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />
        {/* Hair */}
        <path d="M32 20C32 10 58 10 58 20C58 28 54 32 45 32C36 32 32 28 32 20Z" fill="#111111" />
        {/* Torso */}
        <path d="M25 60C25 42 65 42 65 60L70 110H20L25 60Z" fill="#111111" />
        {/* Phone */}
        <rect x="24" y="68" width="14" height="22" rx="3" fill="#FFFFFF" stroke="#111111" strokeWidth="1.5" />
      </g>

      {/* Connection Dotted Waves */}
      <path d="M100 155C120 145 140 165 160 155" stroke="#111111" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
    </svg>
  );
}

export function PromoDealIllustration() {
  return (
    <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill="#FCE7F3" />
      {/* Shopping Cart / Bag */}
      <path d="M25 28H55L50 54H30L25 28Z" fill="#BE185D" />
      <path d="M34 28V22C34 18.7 36.7 16 40 16C43.3 16 46 18.7 46 22V28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      {/* Discount Star */}
      <circle cx="56" cy="24" r="10" fill="#F43F5E" />
      <path d="M53 24H59M56 21V27" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SuccessVictoryIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Glow */}
      <circle cx="100" cy="80" r="65" fill="#F8F6F2" />
      
      {/* Victory Runner Character */}
      <g transform="translate(45, 20)">
        {/* Head with Beard */}
        <circle cx="70" cy="30" r="12" fill="#111111" />
        {/* Torso */}
        <path d="M60 44L75 44L70 80L55 80Z" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
        {/* Victory Flag in Hand */}
        <path d="M30 10L62 48" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
        <path d="M15 10H35L30 28H10L15 10Z" fill="#111111" />
        
        {/* Running Legs */}
        <path d="M58 80L40 105L25 100" stroke="#111111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M68 80L85 98L105 92" stroke="#111111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Speed Action Lines */}
        <path d="M85 45H98" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
        <path d="M82 55H94" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
