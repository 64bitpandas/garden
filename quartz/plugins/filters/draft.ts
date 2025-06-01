import { QuartzFilterPlugin } from "../types"

export const RemoveDrafts: QuartzFilterPlugin<{}> = () => ({
  name: "RemoveDrafts",
  shouldPublish(_ctx, [_tree, vfile]) {
    const draftFlag: boolean =
      vfile.data?.frontmatter?.draft === true || vfile.data?.frontmatter?.draft === "true"
    const privateFlag: boolean =
      vfile.data?.frontmatter?.private === true || vfile.data?.frontmatter?.private === "true"
    return !draftFlag && !privateFlag
  },
})
