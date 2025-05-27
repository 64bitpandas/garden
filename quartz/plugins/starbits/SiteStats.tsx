export default function SiteStats(_props: any) {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
  
  const formattedWordCount = Object.values(global.quartzWordCounts).reduce((a, b) => a + b, 0).toLocaleString()
  const pageCount = Object.keys(global.quartzWordCounts).length

  console.log(global.quartzWordCounts) 
  
  return (
    <span>
      This site was last updated on <b>📆 {formattedDate}</b>. 
      It currently contains <b>✏️ {formattedWordCount} words</b> across <b>📜 {pageCount} pages</b>.
    </span>
  )
}
