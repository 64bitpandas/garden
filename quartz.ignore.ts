export const ignorePatterns = [
  "private",
  "about/templates",
  "newsletter/drafts",
  ".obsidian",
  "daily",
  "blog",
  ...(process.env.GARDEN_DEV ? [] : ["quartz docs"]),
]
