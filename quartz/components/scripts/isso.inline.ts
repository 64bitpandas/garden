// Fix Isso links that have href="#" which causes page reloads
function setupIssoComments() {
  // First, reinitialize the Isso comments for the new page
  const issoThread = document.getElementById("isso-thread")
  if (issoThread) {
    // Clear existing comments to force a reload
    issoThread.innerHTML = "<noscript>Javascript needs to be activated to view comments.</noscript>"

    // Trigger Isso to load comments for the current page
    if (window.Isso) {
      window.Isso.init()
      window.Isso.fetchComments()
    }
  }

  // Set up observer to fix Isso links
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        const issoLinks = document.querySelectorAll(
          ".isso-reply, .isso-edit, .isso-delete, .isso-upvote, .isso-downvote",
        )
        issoLinks.forEach((link) => {
          if (!link.hasAttribute("data-fixed")) {
            link.setAttribute("data-fixed", "true")
            link.addEventListener("click", (e) => {
              e.preventDefault()
              e.stopPropagation()
              // The link's onclick handler will still run
            })
          }
        })
      }
    }
  })

  // Start observing the document with the configured parameters
  if (issoThread) {
    observer.observe(issoThread, { childList: true, subtree: true })
  }
}

// Run on initial page load
setupIssoComments()

// Run on navigation
document.addEventListener("nav", setupIssoComments)
