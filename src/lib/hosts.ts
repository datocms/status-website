/** The places that serve this site. The same build goes to each of them. */
export interface Host {
  label: string;
  origin: string;
  /** Every name under which this host answers. */
  hostnames: string[];
}

export const HOSTS: Host[] = [
  {
    label: 'Main',
    origin: 'https://status.datocms.com',
    // datocms-status.com is an alias of the same Netlify site.
    hostnames: ['status.datocms.com', 'datocms-status.com', 'www.datocms-status.com'],
  },
  {
    label: 'Static Mirror',
    origin: 'https://status2.datocms.com',
    hostnames: ['status2.datocms.com'],
  },
];
