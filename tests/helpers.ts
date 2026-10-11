import { experimental_AstroContainer as AstroContainer } from "astro/container";

/** One Astro container per test file (Container API). */
export const createContainer = () => AstroContainer.create();

/** Number of matches of `pattern` (use the `g` flag) in rendered HTML. */
export const count = (html: string, pattern: RegExp): number => html.match(pattern)?.length ?? 0;
