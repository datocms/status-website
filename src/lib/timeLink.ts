export function timeLink(date: Date, title: string): string {
  return `https://timee.io/${date
    .toISOString()
    .substring(0, 16)
    .replace(/[-:]/g, '')}?tl=${encodeURIComponent(title)}`;
}
