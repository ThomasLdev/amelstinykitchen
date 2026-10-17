export interface Plural {
  zero: string;
  one: string;
  other: string;
}

export function plural(forms: Plural, count: number): string {
  const form = count === 0 ? forms.zero : count === 1 ? forms.one : forms.other;
  return form.replace("%count%", String(count));
}
