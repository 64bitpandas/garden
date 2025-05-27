import { QuartzTransformerPlugin } from "../types"
import { toString } from "mdast-util-to-string"
import { Root } from "mdast"

export interface Options {
  // Any options you want to add
  excludeTags?: string[] // Tags to exclude from word count
  excludeDirs?: string[] // Directories to exclude from word count
}

const defaultOptions: Options = {
  excludeTags: [], // Default: don't exclude any tags
  excludeDirs: [], // Default: don't exclude any directories
}

export const GlobalStats: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  
  return {
    name: "GlobalStats",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, file) => {
            // Skip files with excluded tags
            const fileTags = file.data.frontmatter?.tags || []
            if (opts.excludeTags?.some(tag => fileTags.includes(tag)) || opts.excludeDirs?.some(dir => file.data.slug?.startsWith(dir))) {
              return
            }
            
            // Get the text content of the file
            const text = toString(tree)
            
            // Calculate word count (split by whitespace)
            const wordCount = text.split(/\s+/).filter(Boolean).length
            
            // Store the word count in the file data
            file.data.wordCount = wordCount
            
            // Add to global word count (initialize if needed)
            global.quartzWordCounts ??= {}
            global.quartzWordCounts[file.data.slug!] = wordCount
          }
        },
      ]
    }, 
  }
}

// Add global declaration
declare global {
  var quartzWordCounts: Record<string, number>
}