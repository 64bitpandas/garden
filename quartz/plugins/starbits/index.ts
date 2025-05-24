// Place all exports for custom Starbits here!
import { ComponentType } from "preact"
import Divider from "./divider"

// Create a map of component names to their implementations
const components: Record<string, ComponentType<any>> = {
  "divider": Divider
} as const

// Export the map and individual components
export { components, Divider }
