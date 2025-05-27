// Place all exports for custom Starbits here!
import { ComponentType } from "preact";
import Divider from "./Divider";
import CustomEmojiTable from "./CustomEmojiTable";
import SiteStats from "./SiteStats";
import SpotifyNowPlaying from "./SpotifyNowPlaying";

// Create a map of component names to their implementations
const components: Record<string, ComponentType<any>> = {
  "divider": Divider,
  "custom_emoji_table": CustomEmojiTable,
  "site_stats": SiteStats,
  "spotify_now_playing": SpotifyNowPlaying,
} as const

// Export the map and individual components
export { components };
