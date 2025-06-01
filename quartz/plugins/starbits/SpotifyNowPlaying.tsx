// Actual script located in quartz/components/scripts/homepage.inline.ts

export default function SpotifyNowPlaying(_props: any) {
  return (
    <span>
      <div className="spotify-no-song">I am not currently listening to anything.</div>
      <div className="spotify-now-playing" style="display: none;">
        I am currently listening to
        <a href="https://spotify.com" target="_blank" rel="noopener noreferrer">
          <img src="" alt={``} />
          <span className="spotify-title"></span>
        </a>
        .
      </div>
    </span>
  )
}
