type HeaderProps = {
  icon: string
  title: string
}

export default function HomepageHeader(props: HeaderProps) {
  const iconPath = `/static/emoji/custom/${props.icon}.png`
  return (
    <div className="homepage-header">
      <img className="homepage-header-icon" src={iconPath} alt={props.icon} />
      {props.title}
    </div>
  )
}
