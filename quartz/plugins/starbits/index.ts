// Place all exports for custom Starbits here!
import { ComponentType } from "preact"
import Divider from "./divider"
import CustomEmojiTable from "./CustomEmojiTable"
import SiteStats from "./SiteStats"
import SpotifyNowPlaying from "./SpotifyNowPlaying"
import Weather from "./Weather"
import TurtleNetStatus from "./TurtleNetStatus"
import HomepageTitle from "./HomepageTitle"
import HomepageHeader from "./HomepageHeader"
import Visitors from "./Visitors"
import FriendNet from "./FriendNet"
import MiniBanner from "./MiniBanner"
import SubstackSubscribe from "./SubstackSubscribe"

// Create a map of component names to their implementations
const components: Record<string, ComponentType<any>> = {
  divider: Divider,
  custom_emoji_table: CustomEmojiTable,
  site_stats: SiteStats,
  spotify_now_playing: SpotifyNowPlaying,
  weather: Weather,
  turtlenet_status: TurtleNetStatus,
  homepage_title: HomepageTitle,
  homepage_header: HomepageHeader,
  visitors: Visitors,
  friend_net: FriendNet,
  minibanner: MiniBanner,
  substack_subscribe: SubstackSubscribe,
}

// Export the map and individual components
export { components }
