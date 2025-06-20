
export type TailwindColor =
  | 'slate' | 'gray' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' 
  | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';

export const colorMap: Record<TailwindColor, string> = {
  slate: 'bg-slate-200 border-slate-300',
  gray: 'bg-gray-200 border-gray-300',
  red: 'bg-red-200 border-red-300',
  orange: 'bg-orange-200 border-orange-300',
  amber: 'bg-amber-200 border-amber-300',
  yellow: 'bg-yellow-200 border-yellow-300',
  lime: 'bg-lime-200 border-lime-300',
  green: 'bg-green-200 border-green-300',
  emerald: 'bg-emerald-200 border-emerald-300',
  teal: 'bg-teal-200 border-teal-300',
  cyan: 'bg-cyan-200 border-cyan-300',
  sky: 'bg-sky-200 border-sky-300',
  blue: 'bg-blue-200 border-blue-300',
  indigo: 'bg-indigo-200 border-indigo-300',
  violet: 'bg-violet-200 border-violet-300',
  purple: 'bg-purple-200 border-purple-300',
  fuchsia: 'bg-fuchsia-200 border-fuchsia-300',
  pink: 'bg-pink-200 border-pink-300',
  rose: 'bg-rose-200 border-rose-300',
}

export const tailwindColors: TailwindColor[] = [
  'slate', 'gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
];

export function isTailwindColor(value: unknown): value is TailwindColor {
  return typeof value === 'string' && tailwindColors.includes(value as TailwindColor);
}
