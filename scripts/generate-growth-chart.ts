/**
 * Generates a historical growth chart showing the evolution of published content
 * in the Garden over time using git history.
 *
 * Usage: npx tsx scripts/generate-growth-chart.ts
 *
 * Output:
 * - scripts/growth-data.json: Historical data with timestamps, word counts, and page counts
 * - scripts/growth-chart.png: Dual-axis line chart visualization
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import matter from "gray-matter"
import { toString } from "mdast-util-to-string"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { ignorePatterns } from "../quartz.ignore.js"

// Configuration
const CONTENT_DIR = "content/vsh"
const SUBMODULE_PATH = path.join(process.cwd(), CONTENT_DIR)
const SAMPLE_INTERVAL_DAYS = 7 // Sample one commit per week for performance
const OUTPUT_DATA_PATH = "scripts/growth-data.json"
const OUTPUT_CHART_PATH = "scripts/growth-chart.png"

// Check if content is a git submodule
function isSubmodule(): boolean {
  try {
    const gitModulesPath = path.join(process.cwd(), ".gitmodules")
    if (fs.existsSync(gitModulesPath)) {
      const content = fs.readFileSync(gitModulesPath, "utf-8")
      return content.includes(CONTENT_DIR)
    }
    // Also check if content/vsh has its own .git
    const submoduleGit = path.join(SUBMODULE_PATH, ".git")
    return fs.existsSync(submoduleGit)
  } catch {
    return false
  }
}

interface DataPoint {
  date: string
  wordCount: number
  pageCount: number
  commitHash?: string
}

/**
 * Check if a path should be excluded based on ignore patterns
 */
function shouldExclude(relativePath: string): boolean {
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

/**
 * Count words in a markdown file using the same logic as SiteStats.tsx
 */
function countWordsInFile(filePath: string): number {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const { content, data: frontmatter } = matter(fileContent)

    // Skip files with draft or private flags
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
  } catch {
    return 0
  }
}

/**
 * Process a directory and count words/pages recursively
 */
function processDirectory(
  dirPath: string,
  contentDir: string,
): { totalWordCount: number; pageCount: number } {
  let totalWordCount = 0
  let pageCount = 0

  try {
    const items = fs.readdirSync(dirPath)

    for (const item of items) {
      const itemPath = path.join(dirPath, item)
      const relativePath = path.relative(contentDir, itemPath)

      // Skip excluded paths based on ignore patterns
      if (shouldExclude(relativePath)) {
        continue
      }

      try {
        const stats = fs.statSync(itemPath)

        if (stats.isDirectory()) {
          const { totalWordCount: subWords, pageCount: subPages } = processDirectory(
            itemPath,
            contentDir,
          )
          totalWordCount += subWords
          pageCount += subPages
        } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
          const wordCount = countWordsInFile(itemPath)
          if (wordCount > 0) {
            totalWordCount += wordCount
            pageCount++
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return { totalWordCount, pageCount }
}

/**
 * Get current word/page counts at the current HEAD
 */
function getCurrentStats(): { wordCount: number; pageCount: number } {
  const contentDir = path.join(process.cwd(), CONTENT_DIR)
  if (!fs.existsSync(contentDir)) {
    return { wordCount: 0, pageCount: 0 }
  }
  const { totalWordCount, pageCount } = processDirectory(contentDir, contentDir)
  return { wordCount: totalWordCount, pageCount }
}

/**
 * Get list of commit hashes with their timestamps, sampled by interval
 * Works with submodule if content/vsh is a git submodule
 */
function getCommitHistory(): Array<{ hash: string; date: string }> {
  try {
    const useSubmodule = isSubmodule()
    let result: string

    if (useSubmodule) {
      // Get commits from the submodule directly
      console.log("📁 Detected submodule, using submodule's git history...")
      result = execSync(`git log --format="%H %aI" --date=iso-strict`, {
        encoding: "utf-8",
        maxBuffer: 50 * 1024 * 1024,
        cwd: SUBMODULE_PATH,
      })
    } else {
      // Get all commits that touched content/vsh, with date
      result = execSync(`git log --format="%H %aI" --date=iso-strict -- "${CONTENT_DIR}"`, {
        encoding: "utf-8",
        maxBuffer: 50 * 1024 * 1024,
      })
    }

    const commits: Array<{ hash: string; date: string }> = []
    const lines = result.trim().split("\n").filter(Boolean)

    for (const line of lines) {
      const [hash, ...dateParts] = line.split(" ")
      const date = dateParts.join(" ")
      if (hash && date) {
        commits.push({ hash, date })
      }
    }

    if (commits.length === 0) {
      return []
    }

    // Store the latest commit before reversing
    const latestCommit = commits[0]

    // Sample commits by interval to improve performance
    // Reverse to process oldest-first
    const reversedCommits = [...commits].reverse()
    const sampledCommits: Array<{ hash: string; date: string }> = []
    let lastDate: Date | null = null

    for (const commit of reversedCommits) {
      const commitDate = new Date(commit.date)
      if (!lastDate || daysBetween(lastDate, commitDate) >= SAMPLE_INTERVAL_DAYS) {
        sampledCommits.push(commit)
        lastDate = commitDate
      }
    }

    // Always include the latest commit if not already included
    if (sampledCommits[sampledCommits.length - 1]?.hash !== latestCommit.hash) {
      sampledCommits.push(latestCommit)
    }

    return sampledCommits
  } catch (error) {
    console.error("Error getting commit history:", error)
    return []
  }
}

function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.abs((date2.getTime() - date1.getTime()) / msPerDay)
}

/**
 * Checkout a specific commit and collect stats
 * Works with submodule if content/vsh is a git submodule
 */
function getStatsAtCommit(
  hash: string,
  useSubmodule: boolean,
): { wordCount: number; pageCount: number } | null {
  try {
    if (useSubmodule) {
      // Force checkout in the submodule (detached HEAD mode)
      execSync(`git checkout --force ${hash}`, {
        stdio: "pipe",
        cwd: SUBMODULE_PATH,
      })
    } else {
      // Checkout the commit (detached HEAD) for parent repo
      execSync(`git checkout ${hash} -- "${CONTENT_DIR}"`, { stdio: "pipe" })
    }

    const stats = getCurrentStats()
    return stats
  } catch (error) {
    // Debug: show the error
    if (process.env.DEBUG) {
      console.error(`\nError checking out ${hash}:`, error)
    }
    return null
  }
}

/**
 * Restore the working directory to its original state
 */
function restoreWorkingDirectory(originalBranch: string, useSubmodule: boolean): void {
  try {
    if (useSubmodule) {
      execSync(`git checkout ${originalBranch}`, { stdio: "pipe", cwd: SUBMODULE_PATH })
    } else {
      execSync(`git checkout ${originalBranch} -- "${CONTENT_DIR}"`, { stdio: "pipe" })
    }
    console.log(`\n✅ Restored working directory to ${originalBranch}`)
  } catch (error) {
    console.error("Error restoring working directory:", error)
    if (useSubmodule) {
      console.log("You may need to run: cd content/vsh && git checkout main")
    } else {
      console.log("You may need to run: git checkout HEAD -- content/vsh")
    }
  }
}

/**
 * Get the current branch or commit
 */
function getCurrentBranch(useSubmodule: boolean): string {
  try {
    const cwd = useSubmodule ? SUBMODULE_PATH : process.cwd()
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", cwd }).trim()
    if (branch === "HEAD") {
      // Detached HEAD, get the commit hash
      return execSync("git rev-parse HEAD", { encoding: "utf-8", cwd }).trim()
    }
    return branch
  } catch {
    const cwd = useSubmodule ? SUBMODULE_PATH : process.cwd()
    return execSync("git rev-parse HEAD", { encoding: "utf-8", cwd }).trim()
  }
}

/**
 * Main function to collect historical data
 */
async function collectHistoricalData(): Promise<DataPoint[]> {
  console.log("📊 Collecting historical growth data from git history...\n")

  const useSubmodule = isSubmodule()
  const originalBranch = getCurrentBranch(useSubmodule)
  console.log(`Current branch: ${originalBranch}${useSubmodule ? " (submodule)" : ""}`)

  const commits = getCommitHistory()
  console.log(
    `Found ${commits.length} commits to process (sampled every ${SAMPLE_INTERVAL_DAYS} days)\n`,
  )

  if (commits.length === 0) {
    console.log("No commits found. Using current state only.")
    const current = getCurrentStats()
    return [
      {
        date: new Date().toISOString(),
        wordCount: current.wordCount,
        pageCount: current.pageCount,
      },
    ]
  }

  const dataPoints: DataPoint[] = []

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i]
    const progress = `[${i + 1}/${commits.length}]`
    const dateStr = new Date(commit.date).toLocaleDateString()

    process.stdout.write(`${progress} Processing ${commit.hash.slice(0, 7)} (${dateStr})... `)

    const stats = getStatsAtCommit(commit.hash, useSubmodule)
    if (stats) {
      dataPoints.push({
        date: commit.date,
        wordCount: stats.wordCount,
        pageCount: stats.pageCount,
        commitHash: commit.hash,
      })
      console.log(`${stats.wordCount.toLocaleString()} words, ${stats.pageCount} pages`)
    } else {
      console.log("skipped (error)")
    }
  }

  // Restore working directory
  restoreWorkingDirectory(originalBranch, useSubmodule)

  return dataPoints
}

/**
 * Generate a chart using chart.js and canvas
 */
async function generateChart(dataPoints: DataPoint[]): Promise<void> {
  // Dynamically import chart.js canvas renderer
  const { ChartJSNodeCanvas } = await import("chartjs-node-canvas")

  const width = 1200
  const height = 600

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: "white",
    plugins: {
      // Register the date adapter
      requireLegacy: ["chartjs-adapter-date-fns"],
    },
  })

  // Create data points with x as Date objects for proper time scaling
  const wordCountData = dataPoints.map((d) => ({
    x: new Date(d.date),
    y: d.wordCount,
  }))

  const pageCountData = dataPoints.map((d) => ({
    x: new Date(d.date),
    y: d.pageCount,
  }))

  const configuration = {
    type: "line" as const,
    data: {
      datasets: [
        {
          label: "Word Count",
          data: wordCountData,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          yAxisID: "y",
          tension: 0.1,
          fill: true,
        },
        {
          label: "Page Count",
          data: pageCountData,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          yAxisID: "y1",
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: "Garden Growth Over Time",
          font: { size: 24 },
        },
        legend: {
          position: "top" as const,
        },
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            unit: "month" as const,
            displayFormats: {
              month: "MMM yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          type: "linear" as const,
          display: true,
          position: "left" as const,
          title: {
            display: true,
            text: "Word Count",
          },
          ticks: {
            callback: function (value: number | string) {
              const num = typeof value === "number" ? value : parseFloat(value)
              if (num >= 1000) {
                return (num / 1000).toFixed(0) + "k"
              }
              return num
            },
          },
        },
        y1: {
          type: "linear" as const,
          display: true,
          position: "right" as const,
          title: {
            display: true,
            text: "Page Count",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  }

  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration)
  fs.writeFileSync(OUTPUT_CHART_PATH, buffer)
  console.log(`📈 Chart saved to ${OUTPUT_CHART_PATH}`)
}

/**
 * Generate a Mermaid diagram as an alternative visualization
 */
function generateMermaidDiagram(dataPoints: DataPoint[]): string {
  // Sample data points for Mermaid (max ~20 points for readability)
  const sampleRate = Math.ceil(dataPoints.length / 20)
  const sampledPoints = dataPoints.filter(
    (_, i) => i % sampleRate === 0 || i === dataPoints.length - 1,
  )

  const lines = ["xychart-beta", '  title "Garden Growth Over Time"', "  x-axis ["]

  const xLabels = sampledPoints.map((d) => {
    const date = new Date(d.date)
    return `"${date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}"`
  })
  lines.push("    " + xLabels.join(", "))
  lines.push("  ]")

  lines.push('  y-axis "Word Count" 0 --> ' + Math.max(...sampledPoints.map((d) => d.wordCount)))
  lines.push("  line [" + sampledPoints.map((d) => d.wordCount).join(", ") + "]")

  return lines.join("\n")
}

// Date filter for chart generation (set to null for no filter)
const CHART_START_DATE = new Date("2025-05-01")

/**
 * Regenerate chart from existing JSON data (without re-collecting from git)
 */
async function regenerateChartOnly(): Promise<void> {
  console.log("📊 Regenerating chart from existing data...\n")

  // Load existing data
  const rawData = fs.readFileSync(OUTPUT_DATA_PATH, "utf-8")
  const dataPoints: DataPoint[] = JSON.parse(rawData)

  // Filter by date if configured
  const filteredPoints = CHART_START_DATE
    ? dataPoints.filter((d) => new Date(d.date) >= CHART_START_DATE)
    : dataPoints

  console.log(
    `Loaded ${dataPoints.length} data points, using ${filteredPoints.length} after date filter`,
  )

  // Generate chart
  try {
    await generateChart(filteredPoints)
  } catch (error) {
    console.error("\n⚠️  Could not generate PNG chart:")
    console.error("Error:", error instanceof Error ? error.message : error)
  }

  // Generate Mermaid diagram
  const mermaid = generateMermaidDiagram(filteredPoints)
  const mermaidPath = "scripts/growth-chart.mermaid"
  fs.writeFileSync(mermaidPath, mermaid)
  console.log(`📊 Mermaid diagram saved to ${mermaidPath}`)

  // Summary
  console.log("\n📈 Summary:")
  console.log(`   Total data points: ${filteredPoints.length}`)
  if (filteredPoints.length > 0) {
    const latest = filteredPoints[filteredPoints.length - 1]
    const earliest = filteredPoints[0]
    console.log(
      `   Date range: ${new Date(earliest.date).toLocaleDateString()} - ${new Date(latest.date).toLocaleDateString()}`,
    )
    console.log(`   Current: ${latest.wordCount.toLocaleString()} words, ${latest.pageCount} pages`)
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Check for --chart-only flag to skip data collection
  const chartOnly = process.argv.includes("--chart-only")

  try {
    if (chartOnly) {
      await regenerateChartOnly()
      return
    }

    // Collect data
    const dataPoints = await collectHistoricalData()

    // Sort by date
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Save data to JSON (always save full data)
    const outputData = dataPoints.map(({ date, wordCount, pageCount }) => ({
      date,
      wordCount,
      pageCount,
    }))
    fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify(outputData, null, 2))
    console.log(`\n💾 Data saved to ${OUTPUT_DATA_PATH}`)

    // Filter by date for chart if configured
    const filteredPoints = CHART_START_DATE
      ? dataPoints.filter((d) => new Date(d.date) >= CHART_START_DATE)
      : dataPoints

    if (CHART_START_DATE && filteredPoints.length !== dataPoints.length) {
      console.log(
        `📅 Filtering chart to ${filteredPoints.length} points (from ${CHART_START_DATE.toLocaleDateString()})`,
      )
    }

    // Generate chart
    try {
      await generateChart(filteredPoints)
    } catch (error) {
      console.error("\n⚠️  Could not generate PNG chart. Install chartjs-node-canvas:")
      console.error("   npm install chart.js chartjs-node-canvas")
      console.error("\nError:", error instanceof Error ? error.message : error)
    }

    // Generate Mermaid diagram
    const mermaid = generateMermaidDiagram(filteredPoints)
    const mermaidPath = "scripts/growth-chart.mermaid"
    fs.writeFileSync(mermaidPath, mermaid)
    console.log(`📊 Mermaid diagram saved to ${mermaidPath}`)

    // Summary
    console.log("\n📈 Summary:")
    console.log(`   Total data points: ${filteredPoints.length}`)
    if (filteredPoints.length > 0) {
      const latest = filteredPoints[filteredPoints.length - 1]
      const earliest = filteredPoints[0]
      console.log(
        `   Date range: ${new Date(earliest.date).toLocaleDateString()} - ${new Date(latest.date).toLocaleDateString()}`,
      )
      console.log(
        `   Current: ${latest.wordCount.toLocaleString()} words, ${latest.pageCount} pages`,
      )
    }
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

main()
