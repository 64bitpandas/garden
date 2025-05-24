import fs from 'fs'
import path from 'path'
import { QUARTZ } from '../../util/path'

export default function CustomEmojiTable(_props: any) {
  const customEmojiDir = path.join(QUARTZ, 'static', 'emoji', 'custom')
  let emojis: {name: string, file: string}[] = []
  
  try {
    const files = fs.readdirSync(customEmojiDir)
    
    emojis = files
      .filter(file => file.endsWith('.png') || file.endsWith('.svg'))
      .map(file => ({
        name: path.basename(file, path.extname(file)),
        file
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
    
  } catch (error) {
    return <div>Error loading custom emoji: {error}</div>
  }
  
  return (
    <table>
      <thead>
        <tr>
          <th>Emoji</th>
          <th>Name</th>
          <th>Code</th>
        </tr>
      </thead>
      <tbody>
        {emojis.map(emoji => (
          <tr key={emoji.name}>
            <td>
              <img 
                src={`/static/emoji/custom/${emoji.file}`} 
                alt={emoji.name} 
                class="custom-emoji" 
              />
            </td>
            <td>{emoji.name}</td>
            <td><code>:custom_{emoji.name}:</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}