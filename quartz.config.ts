import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "ben's garden",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "goatcounter",
      websiteId: "garden",
      host: "goatcounter.bencuan.me",
      scriptSrc: "https://goatcounter.bencuan.me/count.js",
    },
    locale: "en-US",
    baseUrl: "garden.bencuan.me",
    ignorePatterns: ["private", "meta/templates", ".obsidian", "daily", "blog", ...(process.env.GARDEN_DEV ? [] : ["quartz docs"])],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "Charter",
        body: "Atkinson Hyperlegible Next",
        code: "Fira Code",
      },
      colors: {
        lightMode: {
          light: "#faf4ed", // background color
          lightgray: "#dfdad9", // search bar background, <hr/> default color, explorer alignment rules, graph edges, code background
          gray: "#9893a5", // subheading, graph forward links
          darkgray: "#575279", // default text color and icons
          dark: "#232634", // explorer subheadings, titles, link icons, code text
          secondary: "#286983", // graph current page, explorer main headings, links
          tertiary: "#e0def4", // text highlight/hover, graph backlinks, current explorer page
          highlight: "#56949f", // internal link background, highlighted text, code highlighting
          textHighlight: "yellow", // making this ugly so i can figure out what it does
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "rose-pine-dawn",
          dark: "rose-pine-moon",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // CustomOgImages is slow; set GARDEN_DEV=1 to disable
      ...(process.env.GARDEN_DEV ? [] : [Plugin.CustomOgImages()]),
    ],
  },
}

export default config
