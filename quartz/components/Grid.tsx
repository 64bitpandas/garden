import { concatenateResources } from "../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type GridConfig = {
  components: {
    Component: QuartzComponent
    width?: string
    height?: string
    area?: string
    justify?: "start" | "end" | "center" | "stretch"
    align?: "start" | "end" | "center" | "stretch"
  }[]
  columns?: string
  rows?: string
  areas?: string[]
  columnGap?: string
  rowGap?: string
  justifyItems?: "start" | "end" | "center" | "stretch"
  alignItems?: "start" | "end" | "center" | "stretch"
}

export default ((config: GridConfig) => {
  const Grid: QuartzComponent = (props: QuartzComponentProps) => {
    const columns = config.columns ?? "1fr"
    const rows = config.rows ?? "auto"
    const columnGap = config.columnGap ?? "1rem"
    const rowGap = config.rowGap ?? "1rem"
    const justifyItems = config.justifyItems ?? "stretch"
    const alignItems = config.alignItems ?? "stretch"
    
    const gridTemplateAreas = config.areas ? 
      `"${config.areas.join('" "')}"` : 
      undefined

    return (
      <div style={`display: grid; grid-template-columns: ${columns}; grid-template-rows: ${rows}; column-gap: ${columnGap}; row-gap: ${rowGap}; justify-items: ${justifyItems}; align-items: ${alignItems}; ${gridTemplateAreas ? `grid-template-areas: ${gridTemplateAreas};` : ''}`}>
        {config.components.map((c) => {
          const width = c.width ?? "auto"
          const height = c.height ?? "auto"
          const area = c.area ?? "auto"
          const justify = c.justify ?? "stretch"
          const align = c.align ?? "stretch"

          return (
            <div
              style={`width: ${width}; height: ${height}; grid-area: ${area}; justify-self: ${justify}; align-self: ${align};`}
            >
              <c.Component {...props} />
            </div>
          )
        })}
      </div>
    )
  }

  Grid.afterDOMLoaded = concatenateResources(
    ...config.components.map((c) => c.Component.afterDOMLoaded),
  )
  Grid.beforeDOMLoaded = concatenateResources(
    ...config.components.map((c) => c.Component.beforeDOMLoaded),
  )
  Grid.css = concatenateResources(...config.components.map((c) => c.Component.css))
  return Grid
}) satisfies QuartzComponentConstructor<GridConfig>