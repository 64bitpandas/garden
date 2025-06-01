// Actual script located in quartz/components/scripts/homepage.inline.ts

export default function TurtleNetStatus(_props: any) {
  return (
    <span>
      <div className="turtlenet-status" style="display: none;">
        🐢{" "}
        <a href="https://status.bencuan.me" target="_blank" rel="noopener noreferrer">
          TurtleNet
        </a>{" "}
        systems are{" "}
        <img
          src="static/emoji/noto-coloremoji-svg/emoji_u2705.svg"
          alt=""
          class="emoji-svg status-icon"
        />{" "}
        <b className="status-info"></b>!
      </div>
    </span>
  )
}
