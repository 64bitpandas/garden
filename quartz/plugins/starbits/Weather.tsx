export default function Weather(_props: any) {
  return (
    <span>
      <script>{`
        async function updateWeatherData() {
          try {
            const response = await fetch('https://api.bencuan.me/weather');
            const data = await response.json();
            if (data) {
              const container = document.querySelector('.weather-now-playing');
              const img = container.querySelector('img');
              const weatherSpan = container.querySelector('.weather-info');
              
              img.src = 'data:image/png;base64,' + data.icon;
              img.alt = data.description + ' weather icon';
              weatherSpan.innerHTML = \`\${data.temperature.toFixed(0)}°F and \${data.description}\`;
              
              container.style.display = 'block';
            }
          } catch (error) {
            console.error('Error fetching Weather data:', error);
          }
        }
        
        // Update initially and every 10 minutes
        updateWeatherData();
        setInterval(updateWeatherData, 600000);
      `}</script>
      <div className="weather-now-playing" style="display: none;">
        It is currently
        <img
          src=""
          alt=""
          style={{
            width: "30px",
            height: "30px",
            margin: "0 5px",
            borderRadius: "50%",
            verticalAlign: "middle",
            backgroundColor: "#99d1db", // catppuccin frappe sky
          }}
        />
        <b className="weather-info"></b>.
      </div>
    </span>
  )
}