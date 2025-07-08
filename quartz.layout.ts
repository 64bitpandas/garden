import { FullPageLayout, PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const explorerCustomIcons = {
  about: "/static/emoji/custom/leaf.png",
  community: "/static/emoji/custom/share_flower.png",
  "game-guides": "/static/emoji/noto-coloremoji-svg/emoji_u1f411.svg",
  homelabbing: "/static/emoji/custom/turtlenet2.png",
  internet: "/static/emoji/custom/trailmarker.png",
  newsletter: "/static/emoji/custom/newsletter.png",
  personal: "/static/emoji/custom/panda.png",
  music: "/static/emoji/custom/musicnote.png",
  recipes: "/static/emoji/noto-coloremoji-svg/emoji_u1f373.svg",
  wip: "/static/emoji/noto-coloremoji-svg/emoji_u1f3d7.svg",
  // Add more folder-icon mappings as needed
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.DesktopOnly(
      Component.Grid({
        components: [
          { Component: Component.Graph(), align: "start" },
          { Component: Component.Backlinks(), align: "start" },
        ],
      }),
    ),
    Component.MobileOnly(Component.Backlinks()),
    Component.MobileOnly(Component.Graph()),
    Component.Comments(), // Add the Comments component here
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/64bitpandas/garden",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
    Component.MobileOrTabletOnly(Component.TableOfContents()),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        {
          Component: Component.MobileOnly(
            Component.Explorer({
              customIcons: explorerCustomIcons,
            }),
          ),
        },
      ],
    }),
    Component.DesktopOnly(
      Component.Explorer({
        customIcons: explorerCustomIcons,
      }),
    ),
  ],
  right: [Component.DesktopOnly(Component.TableOfContents())],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.MobileOrTabletOnly(Component.TableOfContents()),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        {
          Component: Component.MobileOnly(
            Component.Explorer({
              customIcons: explorerCustomIcons,
            }),
          ),
        },
      ],
    }),
    Component.DesktopOnly(
      Component.Explorer({
        customIcons: explorerCustomIcons,
      }),
    ),
  ],
  right: [Component.DesktopOnly(Component.TableOfContents())],
}

// custom layout for the root homepage
export const homepageLayout: FullPageLayout = {
  beforeBody: [],
  left: [
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        {
          Component: Component.MobileOnly(
            Component.Explorer({
              customIcons: explorerCustomIcons,
            }),
          ),
        },
      ],
      direction: "row-reverse",
    }),
    Component.DesktopOnly(
      Component.Explorer({
        customIcons: explorerCustomIcons,
      }),
    ),
  ],
  right: [],
  head: Component.Head(),
  header: [],
  afterBody: [Component.Comments()],
  pageBody: Component.Content(),
  footer: Component.Footer(),
}
