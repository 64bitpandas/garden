export const ignorePatterns = [
  "private",
  "about/templates",
  ".obsidian",
  "daily",
  "blog",
  ...(process.env.GARDEN_DEV ? [] : ["quartz docs"]),
]
