import { h } from "preact"

interface MiniBannerProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function MiniBanner(props: MiniBannerProps) {
  // Default width is 200px, height is auto by default
  const width = props.width || 200;
  const height = props.height || "auto";
  const className = props.className || "mini-banner";
  
  return (
    <div className={className}>
      <img 
        src="/img/minibanner.png" 
        alt="Mini Banner" 
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          display: "block",
          margin: "0 auto"
        }} 
      />
    </div>
  )
}