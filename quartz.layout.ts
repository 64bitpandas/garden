import { FullPageLayout, PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const explorerCustomIcons = {
  meta: "/static/emoji/custom/panda.png",
  projects: "/static/icons/projects.png",
  notes: "/static/icons/notes.png",
  // Add more folder-icon mappings as needed
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.DesktopOnly(
      Component.Flex({
        components: [
          { Component: Component.Graph(), grow: true, align: "start" },
          { Component: Component.Backlinks(), grow: true, align: "start" },
        ],
        direction: "row",
        gap: "2rem",
      }),
    ),
    Component.MobileOnly(Component.Backlinks()),
    Component.MobileOnly(Component.Graph()),
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
    Component.MobileOnly(Component.TableOfContents()),
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
          Component: Component.MobileOnly(Component.Explorer({
            customIcons: explorerCustomIcons,
          })),
        }
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
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
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
  right: [],
}

// custom layout for the root homepage
export const homepageLayout: FullPageLayout = {
  beforeBody: [],
  left: [
    Component.Spacer(),
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
  right: [Component.DesktopOnly(Component.Spacer())],
  head: Component.Head(),
  header: [Component.Spacer()],
  afterBody: [],
  pageBody: Component.Content(),
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/64bitpandas/garden",
    },
  }),
}
