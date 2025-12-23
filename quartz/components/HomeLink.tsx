import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const HomeLink: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  const classes = ["home-link"]
  if (displayClass) {
    classes.push(displayClass)
  }

  return (
    <div class={classes.join(" ")}>
      <a href="https://bencuan.me">← back home to bencuan.me</a>
    </div>
  )
}

HomeLink.css = `
.home-link a {
  font-size: 0.9rem;
  text-decoration: none;
}

.home-link a:hover {
  text-decoration: underline;
}
`

export default (() => HomeLink) satisfies QuartzComponentConstructor
