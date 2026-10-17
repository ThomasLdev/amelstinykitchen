// Inline style: Astro's `transition:name` still emits an auto-generated name when given undefined.
export function viewTransitionStyle(name: string | undefined): string | undefined {
  return name ? `view-transition-name: ${name}` : undefined;
}
