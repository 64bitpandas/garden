import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { toString } from "mdast-util-to-string"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { ignorePatterns } from "../../../quartz.ignore"

export default function SiteStats(_props: any) {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Calculate word counts directly in the component
  let totalWordCount = 0
  let pageCount = 0

  try {
    // Get content directory path
    const contentDir = path.join(process.cwd(), "content/vsh")

    // Function to check if a path should be excluded based on ignore patterns
    const shouldExclude = (relativePath: string): boolean => {
      for (const pattern of ignorePatterns) {
        // Simple wildcard matching for patterns like "private/**"
        if (pattern.endsWith("/**") || pattern.endsWith("/*")) {
          const dirPattern = pattern.replace(/\/\*\*$|\/\*$/, "")
          if (relativePath.startsWith(dirPattern)) {
            return true
          }
        }
        // Exact matching for specific directories
        else if (relativePath === pattern || relativePath.startsWith(pattern + "/")) {
          return true
        }
      }
      return false
    }

    // Function to count words in a markdown file
    const countWordsInFile = (filePath: string): number => {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8")
        const { content, data: frontmatter } = matter(fileContent)

        // Skip files with draft or private flags
        // Check for both boolean and string values (e.g., "true")
        const isDraft = frontmatter.draft === true || frontmatter.draft === "true"
        const isPrivate = frontmatter.private === true || frontmatter.private === "true"

        if (isDraft || isPrivate) {
          return 0
        }

        // Parse markdown to get text content
        const ast = unified().use(remarkParse).parse(content)
        const text = toString(ast)

        // Count words
        return text.split(/\s+/).filter(Boolean).length
      } catch (error) {
        console.error(`Error counting words in ${filePath}:`, error)
        return 0
      }
    }

    // Function to recursively process directories
    const processDirectory = (dirPath: string) => {
      const items = fs.readdirSync(dirPath)

      for (const item of items) {
        const itemPath = path.join(dirPath, item)
        const relativePath = path.relative(contentDir, itemPath)

        // Skip excluded paths based on quartz.config.ts ignorePatterns
        if (shouldExclude(relativePath)) {
          continue
        }

        const stats = fs.statSync(itemPath)

        if (stats.isDirectory()) {
          processDirectory(itemPath)
        } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
          const wordCount = countWordsInFile(itemPath)
          if (wordCount > 0) {
            totalWordCount += wordCount
            pageCount++
          }
        }
      }
    }

    // Start processing from content directory
    processDirectory(contentDir)
  } catch (error) {
    console.error("Error calculating site stats:", error)
  }

  const formattedWordCount = totalWordCount.toLocaleString()

  return (
    <span>
      The Garden was last updated on <b>📆 {formattedDate}</b>. It currently contains{" "}
      <b>✏️ {formattedWordCount} words</b> across <b>📜 {pageCount} pages</b>.
    </span>
  )
}
