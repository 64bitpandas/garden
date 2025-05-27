import path from "path"
import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { pathToRoot } from "../../util/path"
import { defaultContentPageLayout, homepageLayout, sharedPageComponents } from "../../../quartz.layout"
import { Content } from "../../components"
import chalk from "chalk"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { Node } from "unist"
import { StaticResources } from "../../util/resources"
import { QuartzPluginData } from "../vfile"
import { render } from "preact-render-to-string"

async function processContent(
  ctx: BuildCtx,
  tree: Node,
  fileData: QuartzPluginData,
  allFiles: QuartzPluginData[],
  opts: FullPageLayout,
  resources: StaticResources,
) {
  const slug = fileData.slug!
  const cfg = ctx.cfg.configuration
  const externalResources = pageResources(pathToRoot(slug), resources)
  const componentData: QuartzComponentProps = {
    ctx,
    fileData,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }

  const content = renderPage(cfg, slug, componentData, opts, externalResources)
  return write({
    ctx,
    content,
    slug,
    ext: ".html",
  })
}

export const HomePage: QuartzEmitterPlugin<Partial<FullPageLayout>> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...homepageLayout,
    pageBody: Content(),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "HomePage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map((c) => c[1].data)
      let containsIndex = false

      for (const [tree, file] of content) {
        
        // Only process the root index page
        if (file.data.filePath === "content/vsh/index.md") {
          containsIndex = true
          yield processContent(ctx, tree, file.data, allFiles, opts, resources)
        }
      }

      if (!containsIndex) {
        console.log(
          chalk.yellow(
            `\nWarning: you seem to be missing an \`index.md\` home page file at the root of your \`${ctx.argv.directory}\` folder (\`${path.join(ctx.argv.directory, "index.md")} does not exist\`). This may cause errors when deploying.`,
          ),
        )
      }
    },
    async *partialEmit(ctx, content, resources, changeEvents) {
      const allFiles = content.map((c) => c[1].data)

      // Check if root index page was changed
      let indexChanged = false
      for (const changeEvent of changeEvents) {
        if (!changeEvent.file) continue
        if ((changeEvent.type === "add" || changeEvent.type === "change") && 
            changeEvent.file.path === "content/vsh/index.md") {
          indexChanged = true
          break
        }
      }

      // Only process if the root index page changed
      if (indexChanged) {
        for (const [tree, file] of content) {
          if (file.data.filePath === "content/vsh/index.md") {
            yield processContent(ctx, tree, file.data, allFiles, opts, resources)
          }
        }
      }
    },
  }
}
