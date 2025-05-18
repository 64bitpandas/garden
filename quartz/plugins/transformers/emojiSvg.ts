import { QuartzTransformerPlugin } from "../types"
import { findAndReplace, ReplaceFunction } from "mdast-util-find-and-replace"
import { Root } from "mdast"
import { getIconCode } from "../../util/emoji"

// match regular unicode emoji characters
const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu

// matches :custom_<name>:
const customEmojiRegex = /:custom_([a-zA-Z0-9_-]+):/g

interface Options {
  staticPath: string
  className: string
}

const defaultOptions: Options = {
  staticPath: "static/emoji",
  className: "emoji-svg",
}

export const EmojiSvg: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  
  return {
    name: "EmojiSvg",
    markdownPlugins() {
      return [
        () => {
          return async (tree: Root) => {
             const replacements: [RegExp, string | ReplaceFunction][] = [
              [
                emojiRegex,
                (value: string) => {
                  try {
                    const iconCode = getIconCode(value)
                    const svgPath = `${opts.staticPath}/noto-coloremoji-svg/emoji_u${iconCode}.svg`
                    // console.log("Processed emoji:", value, "with code", iconCode)
                    return {
                      type: "html",
                      value: `<img src="${svgPath}" alt="${value}" class="${opts.className}" />`,
                    }
                  } catch (e) {
                    // If emoji processing fails, return the original emoji
                    return {
                      type: "text",
                      value,
                    }
                  }
                },
              ],
              [
                customEmojiRegex,
                (...capture: string[]) => {
                  const name = capture[1]
                  const imgPath = `${opts.staticPath}/custom/${name}.png`
                  return {
                    type: "html",
                    value: `<img src="${imgPath}" alt="${name}" class="custom-emoji ${opts.className}" />`,
                  }
                },
              ],
            ];
            
            findAndReplace(tree, replacements);
          }
        },
      ]
    },
  }
}
