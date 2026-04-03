/**
 * AI Provider SVG Logo Components
 * All logos are vector-accurate representations of each brand mark.
 * Props: size (number), color (string, defaults to brand color)
 */

export function OpenAILogo({ size = 24, color = '#10a37f' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="OpenAI">
      <path
        d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.965 9.965 0 00-7.505-3.348 10.079 10.079 0 00-9.612 6.977 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.347 10.078 10.078 0 009.617-6.981 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.813zM22.498 37.886a7.474 7.474 0 01-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 00.655-1.134V19.054l3.366 1.944a.12.12 0 01.066.092v9.299a7.505 7.505 0 01-7.49 7.496zM6.392 31.006a7.471 7.471 0 01-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 001.308 0l9.724-5.614v3.888a.12.12 0 01-.048.103l-8.051 4.649a7.504 7.504 0 01-10.24-2.744zM4.297 13.62A7.469 7.469 0 018.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 00.654 1.132l9.723 5.614-3.366 1.944a.12.12 0 01-.114.012L7.044 23.86a7.504 7.504 0 01-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 01.114-.012l8.048 4.648a7.498 7.498 0 01-1.158 13.528v-9.476a1.293 1.293 0 00-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 00-1.308 0l-9.723 5.614v-3.888a.12.12 0 01.048-.103l8.05-4.645a7.497 7.497 0 0111.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 01-.065-.092v-9.299a7.497 7.497 0 0112.293-5.756 6.94 6.94 0 00-.236.134l-7.965 4.6a1.294 1.294 0 00-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.498v4.997l-4.331 2.5-4.331-2.5V18z"
        fill={color}
      />
    </svg>
  );
}

export function AnthropicLogo({ size = 24, color = '#d4500c' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 65" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Anthropic">
      <path
        d="M46.456 0H32.113L0 65h16.219l6.284-13.834h34.994L63.781 65H80L46.456 0zm-14.3 37.636 9.844-21.668 9.843 21.668H32.156z"
        fill={color}
      />
    </svg>
  );
}

export function GoogleGeminiLogo({ size = 24, color = '#4285f4' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google Gemini">
      <path
        d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z"
        fill={color}
      />
    </svg>
  );
}

export function MetaLogo({ size = 24, color = '#0866ff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Meta">
      <path
        d="M3.67 14.064c0-2.293.498-4.117 1.282-5.35C5.876 7.3 7.06 6.63 8.498 6.63c1.684 0 2.91.626 4.454 2.712.575.779 1.17 1.697 1.808 2.745l.93 1.549c1.78 2.967 2.803 4.518 3.808 5.624.28.306.553.565.832.77.49.36 1.054.578 1.77.578 1.373 0 2.517-.686 3.313-2.023C26.21 17.037 26.6 15.235 26.6 13c0-2.27-.432-3.997-1.232-5.133-.647-.913-1.603-1.437-2.868-1.437-.96 0-1.742.285-2.46.91-.544.472-1.02 1.12-1.493 1.962l-2.39-1.603c.57-1.008 1.2-1.859 1.9-2.52C19.423 3.597 20.888 3 22.5 3c2.362 0 4.22 1.02 5.528 2.837C29.281 7.573 30 10.052 30 13c0 2.924-.73 5.46-2.098 7.304-1.254 1.696-3.06 2.726-5.162 2.726-1.22 0-2.208-.275-3.102-.883-.628-.43-1.202-.986-1.795-1.663-1.138-1.303-2.273-3.077-3.876-5.68l-.903-1.503c-.672-1.121-1.307-2.108-1.957-2.92-1.212-1.504-2.276-2.17-3.607-2.17-1.146 0-2.056.5-2.733 1.481-.762 1.103-1.17 2.766-1.17 4.972 0 2.207.388 3.801 1.063 4.847.638.994 1.535 1.46 2.706 1.46.85 0 1.59-.24 2.29-.777.62-.474 1.218-1.218 1.836-2.27l2.404 1.564c-.736 1.25-1.524 2.208-2.406 2.881-1.127.856-2.43 1.302-3.994 1.302-2.264 0-4.034-.985-5.293-2.72C4.375 18.99 3.67 16.773 3.67 14.064z"
        fill={color}
      />
    </svg>
  );
}

export function MistralLogo({ size = 24, color = '#f54e42' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mistral">
      <rect x="0" y="0" width="6.857" height="6.857" fill={color} />
      <rect x="8.572" y="0" width="6.857" height="6.857" fill={color} />
      <rect x="17.143" y="0" width="6.857" height="6.857" fill={color} />
      <rect x="0" y="8.572" width="6.857" height="6.857" fill={color} />
      <rect x="17.143" y="8.572" width="6.857" height="6.857" fill={color} />
      <rect x="8.572" y="8.572" width="6.857" height="6.857" fill={color} opacity="0.5" />
      <rect x="0" y="17.143" width="6.857" height="6.857" fill={color} opacity="0.6" />
      <rect x="8.572" y="17.143" width="6.857" height="6.857" fill={color} opacity="0.35" />
    </svg>
  );
}

export function CohereLogo({ size = 24, color = '#39d353' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Cohere">
      <circle cx="18" cy="18" r="16" stroke={color} strokeWidth="3.5" fill="none" />
      <circle cx="18" cy="10" r="3.5" fill={color} />
      <circle cx="26" cy="22" r="3.5" fill={color} />
      <circle cx="10" cy="22" r="3.5" fill={color} />
      <line x1="18" y1="13.5" x2="25" y2="19.5" stroke={color} strokeWidth="2" />
      <line x1="18" y1="13.5" x2="11" y2="19.5" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function GroqLogo({ size = 24, color = '#f55036' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Groq">
      <path
        d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C28.837 36 36 28.837 36 20H20V28C15.582 28 12 24.418 12 20C12 15.582 15.582 12 20 12C22.122 12 24.053 12.842 25.485 14.213L31.07 8.628C27.925 5.727 23.663 4 20 4Z"
        fill={color}
      />
    </svg>
  );
}

// Map provider ID → logo component
export const PROVIDER_LOGOS = {
  openai: OpenAILogo,
  anthropic: AnthropicLogo,
  google: GoogleGeminiLogo,
  meta: MetaLogo,
  mistral: MistralLogo,
  cohere: CohereLogo,
};

// Convenience wrapper: renders the right logo for a providerId
export function ProviderLogo({ providerId, size = 24, color }) {
  const Logo = PROVIDER_LOGOS[providerId];
  if (!Logo) return null;
  return <Logo size={size} color={color} />;
}
