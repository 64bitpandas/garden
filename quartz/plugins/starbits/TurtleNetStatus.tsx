export default function TurtleNetStatus(_props: any) {
  return (
    <span>
      <script>{`
        async function updateTurtleNetStatus() {
          try {
            const response = await fetch('https://api.bencuan.me/status');
            const data = await response.text();
            
            const container = document.querySelector('.turtlenet-status');
            const statusSpan = container.querySelector('.status-info');
            const statusIcon = container.querySelector('.status-icon');
            
            if (data === 'OK') {
              statusSpan.innerHTML = 'online';
            } else {
              statusSpan.innerHTML = 'offline';
              statusIcon.src = 'static/emoji/noto-coloremoji-svg/emoji_u274c.svg';
            }
            
            container.style.display = 'block';
          } catch (error) {
            console.error('Error fetching TurtleNet status:', error);
            
            // Show error state
            const container = document.querySelector('.turtlenet-status');
            const statusSpan = container.querySelector('.status-info');
            const statusIcon = container.querySelector('.status-icon');
            
            statusSpan.innerHTML = 'unknown';
            statusIcon.src = 'static/emoji/noto-coloremoji-svg/emoji_u2753.svg';
            container.style.display = 'block';
          }
        }
        
        // Update initially and every 5 minutes
        updateTurtleNetStatus();
        setInterval(updateTurtleNetStatus, 300000);
      `}</script>
      <div className="turtlenet-status" style="display: none;">
        🐢 <a href="https://status.bencuan.me" target="_blank" rel="noopener noreferrer">TurtleNet</a> systems are{" "}
        <img src="static/emoji/noto-coloremoji-svg/emoji_u2705.svg" alt="" class="emoji-svg status-icon" />
        {" "}
        <b className="status-info"></b>!
      </div>
    </span>
  )
}