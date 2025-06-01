import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default ((component: QuartzComponent) => {
  const Component = component
  const MobileOrTabletOnly: QuartzComponent = (props: QuartzComponentProps) => {
    return <Component displayClass="mobile-or-tablet-only" {...props} />
  }

  MobileOrTabletOnly.displayName = component.displayName
  MobileOrTabletOnly.afterDOMLoaded = component?.afterDOMLoaded
  MobileOrTabletOnly.beforeDOMLoaded = component?.beforeDOMLoaded
  MobileOrTabletOnly.css = component?.css
  return MobileOrTabletOnly
}) satisfies QuartzComponentConstructor<QuartzComponent>