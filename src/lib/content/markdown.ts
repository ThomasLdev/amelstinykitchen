import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";

let processor: ReturnType<typeof createSatteriMarkdownProcessor> | undefined;

export async function renderMarkdown(source: string): Promise<string> {
  processor ??= createSatteriMarkdownProcessor();
  return (await (await processor).render(source)).code;
}
