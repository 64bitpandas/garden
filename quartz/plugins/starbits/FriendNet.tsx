interface Friend {
  name: string
  url: string
  banner?: string // Optional banner image
  hideInList?: boolean // Optional flag to hide in text list
}

const friends: Friend[] = [
  {
    name: "Ben Cuan",
    url: "https://bencuan.me",
    banner: "/static/friends/bencuan.gif",
    hideInList: true,
  },
  { name: "Bill Mao", url: "https://billmao.net", banner: "/static/friends/billmao.jpg" },
  {
    name: "Trinity Chung",
    url: "https://trinityjchung.com",
    banner: "/static/friends/yolkgirl.gif",
  },
  {
    name: "Michael Lisano",
    url: "https://michaellisano.com",
    banner: "/static/friends/michael.gif",
  },
  { name: "Anna Dymchenko", url: "https://anna.dymchenko.com", banner: "/static/friends/adym.png" },
  { name: "Jaysa Garcia", url: "https://jaysa.net", banner: "/static/friends/jaysa.jpg" },
  { name: "Jonathan Zhang", url: "https://rjz.lol", banner: "/static/friends/rjz.png" },
  { name: "Oliver Ni", url: "https://oliver.ni", banner: "/static/friends/oliver.png" },
  { name: "Nikhil Jha", url: "https://nikhiljha.com", banner: "/static/friends/njha.png" },
  {
    name: "OCF",
    url: "https://www.ocf.berkeley.edu",
    banner: "/static/friends/ocf.png",
    hideInList: true,
  },
  {
    name: "TurtleNet",
    url: "https://tsh.sh",
    banner: "/static/friends/turtlenet.gif",
    hideInList: true,
  },
  { name: "Ben Plate", url: "https://ben9583.com" },
  { name: "Ethan Wu", url: "https://ethanwu.dev" },
  { name: "Ronit Nath", url: "https://ronitnath.com" },
  { name: "Albert Ye", url: "https://aly.sh" },
  { name: "Andy Tsai", url: "https://www.ocf.berkeley.edu/~andytsai" },
  { name: "Eric Qian", url: "https://blog.enumc.com" },
  { name: "Omar Hossain", url: "https://epicrider.github.io" },
  { name: "Vikram Peddinti", url: "https://darkflamex1.github.io" },
  { name: "Adarsh Iyer", url: "https://adarshiyer.net" },
  { name: "Elton Pinto", url: "https://www.eltonpinto.me" },
  { name: "James Weng", url: "https://jamesweng.com" },
  { name: "Owen Goebel", url: "https://oagoebel.github.io" },
  { name: "Tino Caer", url: "https://tinocaer.com" },
  { name: "Ishaan Dham", url: "https://ishaandham.com/" },
  { name: "Cameron Custer", url: "https://camcuster.me" },
  { name: "Aditya Balasubramanian", url: "https://aditbala.com" },
]

export default function FriendNet(_props: any) {
  return (
    <div className="friend-net">
      <div className="friend-banners">
        {friends
          .filter((friend) => friend.banner)
          .map((friend) => (
            <a
              href={friend.url}
              class="friend-banner-link"
              target="_blank"
              rel="noopener noreferrer"
              key={friend.url}
            >
              <img src={friend.banner} alt={friend.name} />
            </a>
          ))}
      </div>

      <div className="friend-spacer">
        <br />
        <br />
      </div>

      <div className="friend-list">
        {friends.map(
          (friend, index) =>
            !friend.hideInList && (
              <>
                <a
                  href={friend.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blue-link"
                  key={friend.url}
                >
                  {friend.name}
                </a>
                {index < friends.length - 1 && " - "}
              </>
            ),
        )}
      </div>
    </div>
  )
}
