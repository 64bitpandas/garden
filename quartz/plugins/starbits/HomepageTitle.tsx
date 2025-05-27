
export default function HomepageTitle(_props: any) {
  return (
    <>
      <img className="homepage-top-banner" src="/static/top_banner.png" alt="banner" />
      <div className="homepage-title">
        welcome to the garden!
        <img src="/static/emoji/custom/panda.png" alt="panda" className="homepage-title-panda" />
      </div>
      <div className="homepage-subtitle">
        a digital collection of my incomplete thoughts and ideas.
      </div>
      <img src="/static/divider.png" alt="divider" className="homepage-divider" />
    </>
  )
}
