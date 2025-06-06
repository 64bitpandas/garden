import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { findAndReplace } from "mdast-util-find-and-replace"
import { render } from "preact-render-to-string"
import { ComponentType } from "preact"
import { components as StarbitsComponents } from "../../plugins/starbits"
import { h } from "preact"
import { replaceAllEmoji } from "./emojiInline"
import chalk from "chalk"

interface Options {
  starbitsFolder?: string
  componentPrefix?: string
  componentSuffix?: string
}

const defaultOptions: Options = {
  starbitsFolder: "quartz/plugins/starbits",
  componentPrefix: ":::",
  componentSuffix: ":::",
}

export const Starbits: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  // Create regex pattern based on prefix and suffix
  // This matches :::component_name::: followed by optional JSON props
  const starbitRegex = new RegExp(
    `${opts.componentPrefix}([a-zA-Z0-9_-]+)${opts.componentSuffix}\\s*({[^}]*})?`,
    "g",
  )

  // Function to parse props string into object
  const parseProps = (propsString?: string): Record<string, any> => {
    if (!propsString) return {}

    try {
      // replace all special double quotes with regular double quotes
      propsString = propsString.replaceAll(`“`, '"')
      propsString = propsString.replaceAll(`”`, '"')
      // console.log(chalk.magenta(`\n[Starbits] Parsing props: ${propsString}`))
      return JSON.parse(propsString)
    } catch (err) {
      console.error(`\n[Starbits] Error parsing props:`, err, propsString)
      return {}
    }
  }

  return {
    name: "Starbits",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root) => {
            // Replace all instances of :::component::: {props} with the rendered component HTML
            findAndReplace(tree, [
              [
                starbitRegex,
                (match: string, componentName: string, propsString?: string) => {
                  // Try to load the component
                  const Component = StarbitsComponents[componentName] as ComponentType<any>

                  if (Component) {
                    try {
                      // Parse props if provided
                      const props = propsString ? parseProps(propsString) : {}

                      // Render the component to static HTML
                      let html = render(h(Component, props))

                      // Replace emoji to svg
                      html = replaceAllEmoji(html)

                      console.log(chalk.magenta(`[Starbits] Rendered component ${componentName}`))
                      // console.log(html)
                      return {
                        type: "html",
                        value: html,
                      }
                    } catch (err) {
                      console.error(
                        chalk.red(`[Starbits] Error rendering component ${componentName}:`),
                        err,
                      )
                      return match
                    }
                  } else {
                    // If component doesn't exist, leave as is
                    return match
                  }
                },
              ],
            ])
          }
        },
      ]
    },
    htmlPlugins() {
      return []
    },
  }
}
