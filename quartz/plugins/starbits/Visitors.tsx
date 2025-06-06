const Visitors = () => {
  function updateVisitors() {
    fetch("https://api.bencuan.me/update-claps", {
      method: "POST",
    })
    const container: Element | null = document.querySelector(".visitors")
    if (!container) {
      return
    }
    const visitors = parseInt(container!.innerHTML.split(" ")[1])
    container.innerHTML = `<span className="including-you">${visitors + 1} people were here including you :)</span>`
  }

  return (
    <>
      <script>{updateVisitors.toString()}</script>
      <div className="visitors" />
    </>
  )
}

export default Visitors
