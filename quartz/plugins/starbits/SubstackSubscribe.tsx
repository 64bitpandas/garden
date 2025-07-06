import { h } from "preact"

interface SubstackSubscribeProps {
  width?: string | number;
  height?: string | number;
  username?: string;
  className?: string;
}

export default function SubstackSubscribe(props: SubstackSubscribeProps) {
  // Default values
  const width = props.width || 480;
  const height = props.height || 320;
  const username = props.username || "bencuan";
  const className = props.className || "substack-subscribe";
  
  // Construct the embed URL
  const embedUrl = `https://${username}.substack.com/embed`;
  
  return (
    <div className={className}>
      <iframe 
        src={embedUrl} 
        width={typeof width === 'number' ? width : width} 
        height={typeof height === 'number' ? height : height} 
        style={{ 
          border: "1px solid #EEE", 
          background: "white" 
        }} 
        frameBorder="0" 
        scrolling="no"
        title={`Subscribe to ${username}'s Substack newsletter`}
      />
    </div>
  )
}