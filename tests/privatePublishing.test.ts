import assert from "node:assert"
import { after, before, describe, test } from "node:test"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { minimatch } from "minimatch"
import { ignorePatterns } from "../quartz.ignore"
import { glob } from "../quartz/util/glob"

const vaultPath = fileURLToPath(new URL("../content/vsh", import.meta.url))
const isPrivatePath = (filePath: string) =>
  filePath === "private" || filePath.startsWith("private/")

describe("private content publication guard", () => {
  let fixturePath: string

  before(async () => {
    fixturePath = await mkdtemp(path.join(tmpdir(), "garden-private-content-"))
    for (const relativePath of [
      "public.md",
      "private/direct.md",
      "private/nested/deep.md",
      "private/nested/attachment.png",
    ]) {
      const absolutePath = path.join(fixturePath, relativePath)
      await mkdir(path.dirname(absolutePath), { recursive: true })
      await writeFile(absolutePath, "publication guard fixture")
    }
  })

  after(async () => {
    await rm(fixturePath, { recursive: true, force: true })
  })

  test("build discovery excludes every file under top-level private", async () => {
    const discovered = await glob("**/*.*", fixturePath, ignorePatterns)

    assert(discovered.some((filePath) => filePath === "public.md"))
    assert.equal(discovered.filter(isPrivatePath).length, 0)
  })

  test("incremental build matching excludes private descendants", () => {
    for (const filePath of [
      "private/direct.md",
      "private/nested/deep.md",
      "private/nested/attachment.png",
    ]) {
      assert(
        ignorePatterns.some((pattern) => minimatch(filePath, pattern)),
        `incremental build would process ${filePath}`,
      )
    }
  })

  test("real vault publish inputs contain no private files", async () => {
    const sourceFiles = await glob("**/*.*", vaultPath, [])
    const publishableFiles = await glob("**/*.*", vaultPath, ignorePatterns)

    assert(
      sourceFiles.some(isPrivatePath),
      "privacy guard requires files under content/vsh/private",
    )
    assert.equal(publishableFiles.filter(isPrivatePath).length, 0)
  })
})
