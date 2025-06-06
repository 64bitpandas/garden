// TODO: this script messy af

async function updateWeatherData() {
  try {
    const response = await fetch("https://api.bencuan.me/weather")
    const data = await response.json()
    if (!data) {
      throw new Error("Weather data is empty")
    }
    const container = document.querySelector(".weather-now-playing")
    if (!container) {
      throw new Error("Weather container not found")
    }
    const img = container.querySelector("img")
    if (!img) {
      throw new Error("Weather image not found")
    }
    const weatherSpan = container.querySelector(".weather-info")
    if (!weatherSpan) {
      throw new Error("Weather span not found")
    }

    img.src = "data:image/png;base64," + data.icon
    img.alt = data.description + " weather icon"
    const celsius = (((data.temperature - 32) * 5) / 9).toFixed(0)
    weatherSpan.innerHTML = `${data.temperature.toFixed(0)}°F (${celsius}°C) and ${data.description}`
    ;(container as HTMLElement).style.display = "block"
  } catch (error) {
    console.error("Error fetching Weather data:", error)
  }
}

async function updateTurtleNetStatus() {
  try {
    const response = await fetch("https://api.bencuan.me/status")
    const data = await response.text()

    const container = document.querySelector(".turtlenet-status")
    if (!container) {
      throw new Error("TurtleNet container not found")
    }
    const statusSpan = container.querySelector(".status-info")
    const statusIcon = container.querySelector(".status-icon")

    if (data === "OK") {
      statusSpan!.innerHTML = "online"
    } else {
      statusSpan!.innerHTML = "offline"
      ;(statusIcon as HTMLImageElement)!.src = "static/emoji/noto-coloremoji-svg/emoji_u274c.svg"
    }

    ;(container as HTMLElement).style.display = "block"
  } catch (error) {
    console.error("Error fetching TurtleNet status:", error)

    // Show error state
    const container = document.querySelector(".turtlenet-status")
    const statusSpan = container!.querySelector(".status-info")
    const statusIcon = container!.querySelector(".status-icon")

    statusSpan!.innerHTML = "unknown"
    ;(statusIcon as HTMLImageElement)!.src = "static/emoji/noto-coloremoji-svg/emoji_u2753.svg"
    ;(container as HTMLElement).style.display = "block"
  }
}

async function updateSpotifyData() {
  try {
    const response = await fetch("https://api.bencuan.me/spotify")
    const data = await response.json()
    if (data) {
      if (data.is_playing) {
        const container = document.querySelector(".spotify-now-playing")
        const img = container.querySelector("img")
        const titleSpan = container.querySelector(".spotify-title")

        img.src = data.album_art
        img.alt = data.title + " album art"
        titleSpan.innerHTML = data.artist + " - " + data.album

        const link = container.querySelector("a")
        link.href = data.spotify_link
        container.style.display = "block"
        document.querySelector(".spotify-no-song").style.display = "none"
      } else {
        document.querySelector(".spotify-no-song").style.display = "block"
        document.querySelector(".spotify-now-playing").style.display = "none"
      }
    }
  } catch (error) {
    console.error("Error fetching Spotify data:", error)
  }
}

async function setupVisitors() {
  try {
    const container = document.querySelector(".visitors")
    if (!container) {
      return
    }
    const res = await fetch("https://api.bencuan.me/get-claps")
    const visitors = await res.text()

    // Create elements instead of using complex inline HTML
    container.innerHTML = `${visitors} people were here before you `

    // Create button element
    const button = document.createElement("button")
    button.textContent = "🙋 hey i'm here too!"
    button.addEventListener("click", updateVisitors)

    // Append button to container
    container.appendChild(button)
  } catch (error) {
    console.error("Error fetching visitors:", error)
  }
}

async function updateVisitors() {
  fetch("https://api.bencuan.me/update-claps", {
    method: "POST",
  })
  const container: Element | null = document.querySelector(".visitors")
  if (!container) {
    return
  }
  const visitors = parseInt(container!.innerHTML.split(" ")[0])
  container.innerHTML = `<span class="including-you">${visitors + 1} people were here including you :)</span>`
}

async function setupHomepage() {
  // Only run this function if we're on the homepage
  if (window.location.pathname !== "/") {
    return
  }

  // Kick these off as dangling promises so they run simultaneously
  void updateWeatherData()
  void updateTurtleNetStatus()
  void updateSpotifyData()
}

document.addEventListener("nav", setupHomepage)
setupHomepage()
setupVisitors()
setInterval(setupHomepage, 600000)
