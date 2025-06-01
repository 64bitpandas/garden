export default function SpotifyNowPlaying(_props: any) {
  return (
    <span>
      <script>{`
        async function updateSpotifyData() {
          try {
            const response = await fetch('https://api.bencuan.me/spotify');
            const data = await response.json();
            if (data) {
              if (data.is_playing) {
                const container = document.querySelector('.spotify-now-playing');
                const img = container.querySelector('img');
                const titleSpan = container.querySelector('.spotify-title');
                
                img.src = data.album_art;
                img.alt = data.title + ' album art';
                titleSpan.innerHTML = data.artist + ' - ' + data.album;
                
                const link = container.querySelector('a');
                link.href = data.spotify_link;
                container.style.display = 'block';
                document.querySelector('.spotify-no-song').style.display = 'none';
              } else {
                document.querySelector('.spotify-no-song').style.display = 'block';
                document.querySelector('.spotify-now-playing').style.display = 'none';
              }
            }
          } catch (error) {
            console.error('Error fetching Spotify data:', error);
          }
        }
        
        // Update initially and every minute
        updateSpotifyData();
        setInterval(updateSpotifyData, 60000);
      `}</script>
      <div className="spotify-no-song">I am not currently listening to anything.</div>
      <div className="spotify-now-playing" style="display: none;">
        I am currently listening to
        <a href="https://spotify.com" target="_blank" rel="noopener noreferrer">
          <img
            src=""
            alt={``}
            style={{
              width: "25px",
              height: "25px",
              borderRadius: "1px",
              margin: "0 5px",
              verticalAlign: "middle",
            }}
          />
          <b className="spotify-title"></b>
        </a>
        .
      </div>
    </span>
  )
}
