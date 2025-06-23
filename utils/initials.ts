
export default function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');
}