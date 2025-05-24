// Place all exports for custom Starbits here!
import { ComponentType } from "preact";
import Divider from "./Divider";
import CustomEmojiTable from "./CustomEmojiTable";

// Create a map of component names to their implementations
const components: Record<string, ComponentType<any>> = {
  "divider": Divider,
  "custom_emoji_table": CustomEmojiTable,
} as const

// Export the map and individual components
export { components }
