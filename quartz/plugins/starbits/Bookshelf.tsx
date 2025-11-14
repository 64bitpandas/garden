import booksData from "../../../content/vsh/personal/_books.json"

type Book = {
  title: string
  author: string
  image: string
  rating?: number
  description: string
  date: string
  genres?: string
  place?: string
  placeUrl?: string
}

export default function Bookshelf(_props: any) {
  const books = booksData as Book[]

  // Sort by date descending (most recent first)
  const sortedBooks = [...books].sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })

  const renderStars = (rating: number) => {
    if (rating === 0) return null
    const stars = []
    for (let i = 0; i < rating; i++) {
      stars.push(
        <img
          key={i}
          src={`/static/emoji/custom/star${rating}.png`}
          alt={`${rating} star${rating > 1 ? "s" : ""}`}
          class="custom-emoji emoji-svg"
        />,
      )
    }
    return stars
  }

  const renderBook = (book: Book) => (
    <div key={book.title} className="book-container">
      <div className="book-cover-wrapper">
        <img src={`https://bencuan.me/img/books/${book.image}`} alt={book.title} />
      </div>
      <div className="book-right">
        <div className="book-title">{book.title}</div>

        <div className="book-metadata">
          <span className="book-author">by {book.author}</span>
          {book.genres && <span className="book-genres">{book.genres}</span>}
          {book.place && (
            <span className="book-place">
              <span className="custom-emoji">📍</span>
              {book.placeUrl ? (
                <a
                  href={book.placeUrl}
                  className="external"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {book.place}
                </a>
              ) : (
                book.place
              )}
            </span>
          )}
        </div>

        {book.rating && book.rating > 0 && (
          <div className="book-rating">{renderStars(book.rating)}</div>
        )}

        <p className="book-description">{book.description}</p>
      </div>
    </div>
  )

  return <div className="bookshelf">{sortedBooks.map(renderBook)}</div>
}
