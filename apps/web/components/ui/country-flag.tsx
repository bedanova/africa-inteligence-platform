interface Props {
  iso3: string
  countryName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_MAP = {
  sm:  'w-4 h-3',
  md:  'w-5 h-4',
  lg:  'w-8 h-6',
  xl:  'w-12 h-9',
}

// ISO3 → ISO2 mapping for flag-icons (uses ISO 3166-1 alpha-2)
const ISO3_TO_ISO2: Record<string, string> = {
  KEN: 'ke', ETH: 'et', TZA: 'tz', RWA: 'rw', UGA: 'ug', MOZ: 'mz',
  NGA: 'ng', GHA: 'gh', SEN: 'sn', CIV: 'ci', CMR: 'cm',
  ZAF: 'za', ZMB: 'zm', AGO: 'ao',
  EGY: 'eg', MAR: 'ma', DZA: 'dz', TUN: 'tn',
  COD: 'cd', MDG: 'mg',
}

export function CountryFlag({ iso3, countryName, size = 'md', className = '' }: Props) {
  const iso2 = ISO3_TO_ISO2[iso3] ?? iso3.toLowerCase().slice(0, 2)
  return (
    <span
      className={`fi fi-${iso2} ${SIZE_MAP[size]} inline-block flex-shrink-0 rounded-sm ${className}`}
      role="img"
      aria-label={countryName ? `${countryName} flag` : `${iso3} flag`}
    />
  )
}
