import assert from "node:assert"
import { describe, test } from "node:test"
import { readFileSync } from "node:fs"
import vm from "node:vm"

class Plugin {}
class TFile {
  path: string
  extension: string
  basename: string

  constructor(path: string) {
    this.path = path
    this.extension = path.split(".").pop() ?? ""
    this.basename =
      path
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") ?? ""
  }
}
class TFolder {
  constructor(public path: string) {}
}

const pluginPath = new URL(
  "../content/vsh/.obsidian/plugins/auto-file-color/main.js",
  import.meta.url,
)

function loadPlugin(): new () => { app: unknown; refresh(): void } {
  const sandbox = {
    module: { exports: {} },
    require: (request: string) => {
      if (request === "obsidian") return { Plugin, TFile }
      throw new Error(`Unexpected module: ${request}`)
    },
  }
  vm.runInNewContext(readFileSync(pluginPath, "utf8"), sandbox)
  return sandbox.module.exports as new () => { app: unknown; refresh(): void }
}

function fileItem(...initialClasses: string[]) {
  const classes = new Set(initialClasses)
  return {
    classes,
    el: {
      classList: {
        add: (...names: string[]) => names.forEach((name) => classes.add(name)),
        remove: (...names: string[]) => names.forEach((name) => classes.delete(name)),
      },
    },
  }
}

describe("Auto File Color private tree rule", () => {
  test("colors the private folder and every descendant red", () => {
    const files = {
      private: new TFolder("private"),
      "private/nested": new TFolder("private/nested"),
      "private/nested/image.png": new TFile("private/nested/image.png"),
      "private/index.md": new TFile("private/index.md"),
      "reading/index.md": new TFile("reading/index.md"),
    }
    const items = Object.fromEntries(Object.keys(files).map((path) => [path, fileItem()]))
    const AutoFileColor = loadPlugin()
    const plugin = new AutoFileColor()
    plugin.app = {
      vault: { getAbstractFileByPath: (path: keyof typeof files) => files[path] },
      metadataCache: { getFileCache: () => ({ frontmatter: {} }) },
      workspace: { getLeavesOfType: () => [{ view: { fileItems: items } }] },
    }

    plugin.refresh()

    for (const path of Object.keys(files).filter(isPrivatePath)) {
      assert(items[path].classes.has("auto-file-color-red"), path)
      assert(!items[path].classes.has("auto-file-color-purple"), path)
    }
    assert(items["reading/index.md"].classes.has("auto-file-color-purple"))
  })

  test("styles red folder titles as well as files", () => {
    const styles = readFileSync(new URL("styles.css", pluginPath), "utf8")
    assert.match(styles, /auto-file-color-red[\s\S]*> \.nav-folder-title/)
  })
})

function isPrivatePath(path: string) {
  return path === "private" || path.startsWith("private/")
}
