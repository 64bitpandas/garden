// Actual script located in quartz/components/scripts/homepage.inline.ts

export default function Weather(_props: any) {
  return (
    <span className="weather-now-playing" style="display: none;">
      It is currently
      <img src="" alt="" />
      <b className="weather-info"></b>.
    </span>
  )
}
