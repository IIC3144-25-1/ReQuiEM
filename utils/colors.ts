
export type TailwindColor =
  | 'slate' | 'gray' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' 
  | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';

export const colorMap: Record<TailwindColor, string> = {
  slate: 'bg-slate-200 border-slate-300 text-slate-600',
  gray: 'bg-gray-200 border-gray-300 text-gray-600',
  red: 'bg-red-200 border-red-300 text-red-600',
  orange: 'bg-orange-200 border-orange-300 text-orange-600',
  amber: 'bg-amber-200 border-amber-300 text-amber-600',
  yellow: 'bg-yellow-200 border-yellow-300 text-yellow-600',
  lime: 'bg-lime-200 border-lime-300 text-lime-600',
  green: 'bg-green-200 border-green-300 text-green-600',
  emerald: 'bg-emerald-200 border-emerald-300 text-emerald-600',
  teal: 'bg-teal-200 border-teal-300 text-teal-600',
  cyan: 'bg-cyan-200 border-cyan-300 text-cyan-600',
  sky: 'bg-sky-200 border-sky-300 text-sky-600',
  blue: 'bg-blue-200 border-blue-300 text-blue-600',
  indigo: 'bg-indigo-200 border-indigo-300 text-indigo-600',
  violet: 'bg-violet-200 border-violet-300 text-violet-600',
  purple: 'bg-purple-200 border-purple-300 text-purple-600',
  fuchsia: 'bg-fuchsia-200 border-fuchsia-300 text-fuchsia-600',
  pink: 'bg-pink-200 border-pink-300 text-pink-600',
  rose: 'bg-rose-200 border-rose-300 text-rose-600',
}

export const tailwindColors: TailwindColor[] = [
  'slate', 'gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
];

export function isTailwindColor(value: unknown): value is TailwindColor {
  return typeof value === 'string' && tailwindColors.includes(value as TailwindColor);
}
