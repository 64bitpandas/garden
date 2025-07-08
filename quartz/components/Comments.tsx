import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import issoScript from "./scripts/isso.inline"

const Comments: QuartzComponent = ({}: QuartzComponentProps) => {
  return (
    <div className="comments-section">
      <script
        data-isso="https://comments.bencuan.me/"
        src="https://comments.bencuan.me/js/embed.min.js"
        data-isso-id={`thread-${typeof window !== "undefined" ? window.location.pathname : ""}`}
      ></script>
      <section id="isso-thread">
        <noscript>Javascript needs to be activated to view comments.</noscript>
      </section>
    </div>
  )
}

// Add the script to fix Isso links behavior
Comments.afterDOMLoaded = issoScript

export default (() => Comments) satisfies QuartzComponentConstructor
