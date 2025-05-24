
import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { findAndReplace } from "mdast-util-find-and-replace"
import { render } from "preact-render-to-string"
import { ComponentType } from "preact"
import { components as StarbitsComponents } from "../../plugins/starbits"
import { h } from "preact"


interface Options {
  starbitsFolder?: string
  componentPrefix?: string
  componentSuffix?: string
}

const defaultOptions: Options = {
  starbitsFolder: "quartz/plugins/starbits",
  componentPrefix: ":::",
  componentSuffix: ":::"
}

export const Starbits: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  
  // Create regex pattern based on prefix and suffix
  // This matches :::component_name::: followed by optional JSON props
  const starbitRegex = new RegExp(
    `${opts.componentPrefix}([a-zA-Z0-9_-]+)${opts.componentSuffix}\\s*({[^}]*})?`, 
    "g"
  )

  
  // Function to parse props string into object
  const parseProps = (propsString?: string): Record<string, any> => {
    if (!propsString) return {}
    
    try {
      // Convert the props string to valid JSON
      // 1. Replace single quotes with double quotes
      let jsonProps = propsString.replace(/'/g, '"')
      
      // 2. Add quotes around unquoted keys
      jsonProps = jsonProps.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
      
      // 3. Handle special values like true, false, null, undefined
      jsonProps = jsonProps
        .replace(/"(true|false|null|undefined)"/g, (_, val) => val)
        .replace(/:\s*"(true|false|null|undefined)"/g, (_, val) => ': ' + val)
      
      // Parse the JSON
      return JSON.parse(jsonProps)
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
                      const html = render(h(Component, props))
                      
                      console.log(`\n[Starbits] Rendered component ${componentName}`)
                      return {
                        type: "html",
                        value: html
                      }
                    } catch (err) {
                      console.error(`\n[Starbits] Error rendering component ${componentName}:`, err)
                      return match
                    }
                  } else {
                    // If component doesn't exist, leave as is
                    return match
                  }
                }
              ]
            ])
          }
        }
      ]
    },
    htmlPlugins() {
      return []
    }
  }
}

