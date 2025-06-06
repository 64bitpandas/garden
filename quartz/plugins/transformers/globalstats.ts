import { QuartzTransformerPlugin } from "../types"
import { toString } from "mdast-util-to-string"
import { Root } from "mdast"

export interface Options {
  // Any options you want to add
  excludeTags?: string[] // Tags to exclude from word count
  excludeDirs?: string[] // Directories to exclude from word count
  excludeFiles?: string[] // Specific files to exclude from word count
}

const defaultOptions: Options = {
  excludeTags: [],
  excludeDirs: [],
  excludeFiles: [],
}

export const GlobalStats: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "GlobalStats",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, file) => {
            // Initialize global word count object if it doesn't exist
            global.quartzWordCounts ??= {}

            // Skip files with excluded tags
            const fileTags = file.data.frontmatter?.tags || []
            const filePath = file.data.filePath || ""
            const fileSlug = file.data.slug || ""

            // Check if file should be excluded
            const shouldExclude =
              // Skip specific excluded files
              opts.excludeFiles?.includes(filePath) ||
              // Skip files with excluded tags
              opts.excludeTags?.some((tag) => fileTags.includes(tag)) ||
              // Skip files in excluded directories
              opts.excludeDirs?.some((dir) => fileSlug.startsWith(dir))

            if (shouldExclude) {
              // Remove from global counts if previously counted
              if (fileSlug && fileSlug in global.quartzWordCounts) {
                delete global.quartzWordCounts[fileSlug]
              }
              return
            }

            // Get the text content of the file
            const text = toString(tree)

            // Calculate word count (split by whitespace)
            const wordCount = text.split(/\s+/).filter(Boolean).length

            // Store the word count in the file data
            file.data.wordCount = wordCount

            // Add to global word count
            if (fileSlug) {
              global.quartzWordCounts[fileSlug] = wordCount
            }

            // Log for debugging
            if (process.env.NODE_ENV === "development") {
              console.log(`[GlobalStats] Counted ${wordCount} words in ${fileSlug}`)
            }
          }
        },
      ]
    },

    // Add a configuration function to reset counts between builds
    configurePlugins() {
      // Reset global word counts at the start of each build
      global.quartzWordCounts = {}
      return {}
    },
  }
}

// Add global declaration
declare global {
  var quartzWordCounts: Record<string, number>
}
