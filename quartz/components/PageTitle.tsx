import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  const bannerPath = `${baseDir}/static/gardenbanner.png`
  
  return (
    <div class={classNames(displayClass, "page-title")}>
      <a href={baseDir}>
        <img src={bannerPath} alt={title} class="page-title-banner" />
      </a>
    </div>
  )
}

PageTitle.css = `
.page-title {
  margin: 0;
  display: flex;
  align-items: center;
}

.page-title a {
  display: flex;
  align-items: center;
}

.page-title-banner {
  height: auto;
  width: 100%;
  max-width: 300px;
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
