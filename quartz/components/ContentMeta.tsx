import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"
import { getDate } from "./Date"

interface ContentMetaOptions {
  /**
   * Whether to display reading time
   */
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: false,
}

const STAGES = {
  "0": "sprout",
  "1": "blossom",
  "2": "evergreen",
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  // Merge options with defaults
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text

    if (text) {
      const segments: (string | JSX.Element)[] = []

      // Add stage if available
      if (fileData.frontmatter?.stage !== undefined) {
        const stage = fileData.frontmatter.stage! as string;
        const stageName = STAGES[stage as keyof typeof STAGES] || "unknown"
        segments.push(
          <span class="stage-header">
            <img src={`/static/emoji/custom/${stageName}.png`} alt={stageName} class="custom-emoji contentmeta-emoji" /> 
            {stageName}
            {" "}
            {fileData.slug !== "meta/Note-Stages" && (
              <a href="/meta/Note-Stages" data-slug="Note-Stages" class="stage-info internal alias question-mark" title="Learn about note stages">
                (?)
              </a>
            )}
            <span> </span>
          </span>
          
        )
      }




      // use the initial creation date. this defaults to the `date` frontmatter, and if not found, the git commit history
      if (fileData.dates?.created) {
        let createdDate = getDate(cfg, fileData);
        if (createdDate) {
          console.log(createdDate);
        } else {
          createdDate = fileData.dates.created;
        }
        segments.push(
          <span>created {createdDate.toISOString().split('T')[0]}</span>
        )
      }

      // Add last-modified date if exists
      if (fileData.dates?.modified) {
        const modifiedDate = fileData.dates.modified
        segments.push(
          <span>, last edited {modifiedDate.toISOString().split('T')[0]}</span>
        )
      }



      segments.push(<span> | </span>)

      // Display word count
      if (options.showReadingTime) {
        const { words } = readingTime(text)
        segments.push(<span>{words} words</span>)
      }

      return (
        <p show-comma={options.showComma} class={classNames(displayClass, "content-meta")}>
          {segments}
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
