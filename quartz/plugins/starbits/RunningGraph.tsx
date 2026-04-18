// Running graph Starbit - renders a chart of running stats
// The chart is initialized client-side via quartz/components/scripts/runninggraph.inline.ts

type Category = "DISH" | "RACE"

type RunEntry = {
  date: string // YYYY-MM-DD
  timeOfDay?: string // HH:MM (optional)
  totalTime: string // MM:SS
  distance: number // miles
  category: Category
  name?: string // optional, used for races
}

// Running log data
const RUNNING_LOG: RunEntry[] = [
  {
    date: "2026-02-01",
    totalTime: "46:06",
    distance: 6.21,
    category: "RACE",
    name: "San Francisco 10K",
  },
  { date: "2026-02-20", totalTime: "69:19", distance: 7.36, category: "DISH" },
  { date: "2026-02-27", totalTime: "68:22", distance: 7.15, category: "DISH" },
  { date: "2026-03-14", totalTime: "69:07", distance: 7.1, category: "DISH" },
  { date: "2026-03-22", totalTime: "66:32", distance: 7.21, category: "DISH" },
  { date: "2026-03-29", totalTime: "76:16", distance: 7.06, category: "DISH" },
  { date: "2026-04-04", totalTime: "65:29", distance: 7.19, category: "DISH" },
  { date: "2026-04-17", totalTime: "61:56", distance: 7.09, category: "DISH" },
]

// Helper to convert MM:SS to total seconds
function timeToSeconds(time: string): number {
  const [minutes, seconds] = time.split(":").map(Number)
  return minutes * 60 + seconds
}

// Helper to calculate pace (seconds per mile)
function calculatePace(totalTime: string, distance: number): number {
  const totalSeconds = timeToSeconds(totalTime)
  return totalSeconds / distance
}

// Helper to format pace as M:SS
function formatPace(paceSeconds: number): string {
  const minutes = Math.floor(paceSeconds / 60)
  const seconds = Math.round(paceSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export default function RunningGraph(_props: any) {
  // Sort entries by date
  const sortedLog = [...RUNNING_LOG].sort((a, b) => a.date.localeCompare(b.date))

  // Prepare data for the chart - will be read by the inline script
  const chartData = sortedLog.map((entry) => ({
    date: entry.date,
    timeOfDay: entry.timeOfDay,
    totalTime: entry.totalTime,
    distance: entry.distance,
    category: entry.category,
    name: entry.name,
    paceSeconds: calculatePace(entry.totalTime, entry.distance),
    paceFormatted: formatPace(calculatePace(entry.totalTime, entry.distance)),
  }))

  return (
    <div className="running-graph-container">
      <canvas
        id="running-graph-canvas"
        data-running-log={JSON.stringify(chartData)}
        style={{ width: "100%", maxHeight: "400px" }}
      ></canvas>
      <div className="running-graph-legend">
        <span className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#A1B5A6" }}></span>
          DISH
        </span>
        <span className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#FA969D" }}></span>
          RACE
        </span>
      </div>
    </div>
  )
}

export { RUNNING_LOG, type RunEntry, type Category, formatPace, calculatePace, timeToSeconds }
