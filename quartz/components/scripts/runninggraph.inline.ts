// Client-side script for rendering the running graph using Chart.js

type ChartDataPoint = {
  date: string
  timeOfDay?: string
  totalTime: string
  distance: number
  category: "DISH" | "RACE"
  name?: string
  paceSeconds: number
  paceFormatted: string
}

let chartInstance: any = null

async function setupRunningGraph() {
  const canvas = document.getElementById("running-graph-canvas") as HTMLCanvasElement | null
  if (!canvas) return

  const dataAttr = canvas.getAttribute("data-running-log")
  if (!dataAttr) return

  const data: ChartDataPoint[] = JSON.parse(dataAttr)
  if (data.length === 0) return

  // Dynamically import Chart.js first, then the date adapter
  const Chart = await import(
    // @ts-ignore
    "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
  ).then((m) => m.default || (window as any).Chart)

  // Load the date adapter after Chart.js is available
  await import(
    // @ts-ignore
    "https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js"
  )

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  // Separate data by category
  const dishData = data.filter((d) => d.category === "DISH")
  const raceData = data.filter((d) => d.category === "RACE")

  // Convert pace from seconds to minutes for display (e.g., 600 seconds = 10 minutes)
  const paceToMinutes = (paceSeconds: number) => paceSeconds / 60

  // Calculate min/max dates with padding for the time axis
  const allDates = data.map((d) => new Date(d.date).getTime()).sort((a, b) => a - b)
  const minDate = new Date(allDates[0])
  const maxDate = new Date(allDates[allDates.length - 1])

  // Add 7 days buffer on each side
  minDate.setDate(minDate.getDate() - 7)
  maxDate.setDate(maxDate.getDate() + 7)

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          label: "DISH",
          data: dishData.map((d) => ({
            x: d.date,
            y: paceToMinutes(d.paceSeconds),
            totalTime: d.totalTime,
            paceFormatted: d.paceFormatted,
            name: d.name,
            distance: d.distance,
          })),
          borderColor: "#A1B5A6",
          backgroundColor: "#A1B5A6",
          pointBackgroundColor: "#A1B5A6",
          pointBorderColor: "#A1B5A6",
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: true,
          tension: 0.1,
        },
        {
          label: "RACE",
          data: raceData.map((d) => ({
            x: d.date,
            y: paceToMinutes(d.paceSeconds),
            totalTime: d.totalTime,
            paceFormatted: d.paceFormatted,
            name: d.name,
            distance: d.distance,
          })),
          borderColor: "#FA969D",
          backgroundColor: "#FA969D",
          pointBackgroundColor: "#FA969D",
          pointBorderColor: "#FA969D",
          pointRadius: 8,
          pointHoverRadius: 10,
          showLine: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 40,
          bottom: 10,
        },
      },
      scales: {
        x: {
          type: "time",
          min: minDate.toISOString(),
          max: maxDate.toISOString(),
          time: {
            unit: "week",
            displayFormats: {
              week: "MMM d",
            },
          },
          title: {
            display: true,
            text: "Date",
            color: "#1a1a1a",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            color: "#1a1a1a",
            font: {
              size: 12,
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        y: {
          title: {
            display: true,
            text: "Pace (min/mile)",
            color: "#1a1a1a",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          reverse: false, // Slower pace at top
          ticks: {
            color: "#1a1a1a",
            font: {
              size: 12,
            },
            callback: function (value: number) {
              const mins = Math.floor(value)
              const secs = Math.round((value - mins) * 60)
              return `${mins}:${secs.toString().padStart(2, "0")}`
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context: any) {
              const date = new Date(context[0].raw.x)
              return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            },
            label: function (context: any) {
              const point = context.raw
              const label = point.name ? `${point.name}: ` : ""
              const distanceStr = point.distance ? ` - ${point.distance.toFixed(2)} mi` : ""
              return `${label}${point.totalTime} (${point.paceFormatted}/mi)${distanceStr}`
            },
          },
        },
        legend: {
          display: false,
        },
        // Custom plugin to draw labels on points
        datalabels: false,
      },
    },
    plugins: [
      {
        id: "customCanvasBackgroundColor",
        beforeDraw: (chart: any) => {
          const ctx = chart.canvas.getContext("2d")
          ctx.save()
          ctx.globalCompositeOperation = "destination-over"
          ctx.fillStyle = "transparent"
          ctx.fillRect(0, 0, chart.width, chart.height)
          ctx.restore()
        },
      },
      {
        id: "pointLabels",
        afterDatasetsDraw(chart: any) {
          const ctx = chart.ctx
          chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
            const meta = chart.getDatasetMeta(datasetIndex)
            meta.data.forEach((point: any, index: number) => {
              const data = dataset.data[index]
              const x = point.x
              const y = point.y

              ctx.save()
              ctx.font = "bold 12px sans-serif"
              ctx.textAlign = "center"
              ctx.fillStyle = "#1a1a1a"

              // Format label
              let label = `${data.totalTime} (${data.paceFormatted})`
              if (data.name) {
                label = `${data.name}\n${label}`
              }

              // Draw label above point
              const lines = label.split("\n")
              lines.forEach((line: string, i: number) => {
                ctx.fillText(line, x, y - 15 - (lines.length - 1 - i) * 14)
              })
              ctx.restore()
            })
          })
        },
      },
    ],
  })
}

document.addEventListener("nav", () => {
  setupRunningGraph()
})

setupRunningGraph()
