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

export function emojiToSvg(emoji: string, opts: Options) {
  const iconCode = getIconCode(emoji)
  const svgPath = `${opts.staticPath}/noto-coloremoji-svg/emoji_u${iconCode}.svg`
  return `<img src="${svgPath}" alt="${emoji}" class="${opts.className}" />`
}

export function replaceAllEmoji(html: string) {
  return html.replaceAll(emojiRegex, (value: string) => {
    try {
      const svgPath = emojiToSvg(value, defaultOptions)
      return svgPath
    } catch (e) {
      // If emoji processing fails, return the original emoji
      return value
    }
  })
}

export function makeCustomEmoji(emoji: string, opts: Options) {
  const imgPath = `${opts.staticPath}/custom/${emoji}.png`
  const baseHtml = `<img src="${imgPath}" alt="${emoji}" class="custom-emoji ${opts.className}" />`

  // Special case: duplicate stars if using ratings
  if (emoji === "star2") {
    return baseHtml.repeat(2)
  } else if (emoji === "star3") {
    return baseHtml.repeat(3)
  } else {
    return baseHtml
  }
}

export const CustomInlineEmoji: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  
  return {
    name: "CustomInlineEmoji",
    markdownPlugins() {
      return [
        () => {
          return async (tree: Root) => {
             const replacements: [RegExp, string | ReplaceFunction][] = [
              [
                emojiRegex,
                (value: string) => {
                  try {
                    const svgPath = emojiToSvg(value, opts)
                    return {
                      type: "html",
                      value: svgPath,
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
                  return {
                    type: "html",
                    value: makeCustomEmoji(name, opts),
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
