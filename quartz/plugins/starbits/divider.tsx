
interface Options {
  height?: string
  className?: string
}

export default function Divider(props: Options) {
    return (
      <div className={props.className ?? "content-divider"}>
        <img 
          src="/static/divider.png" 
          alt="Decorative divider" 
          style={{ 
            height: props.height,
            width: "auto",
            display: "block",
            margin: "1.5rem auto"
          }} 
        />
      </div>
    )
  }
