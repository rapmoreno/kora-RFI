/**
 * Module: BookCoverManager.js
 * Type: Manager (public/js pattern)
 * Purpose: Extract book mentions from AI responses, search OpenLibrary for covers,
 *          and display single/multiple book cover cards in the UI.
 *
 * Depends on: OpenLibrary API (covers.openlibrary.org, openlibrary.org/search.json)
 * Used by: ChatManager (processTextForBooks called on every AI response)
 * Side effects: DOM manipulation, HTTP requests to OpenLibrary
 */

export class BookCoverManager {
  constructor() {
    this.currentBookCover = null;
    this.currentMultipleBooks = [];
    this.bookCoverTimeout = null;
  }

  // =====================================================
  // BOOK INFORMATION EXTRACTION
  // =====================================================
  extractBookInfo(text) {
    const patterns = [
      /"([^"]+)"\s+by\s+([^,.!?]+)/gi,
      /(?:book|novel|story)\s+([A-Z][^,!?.]*?)\s+by\s+([^,.!?]+)/gi,
      /([A-Z][A-Za-z\s]+)\s+by\s+([A-Z][A-Za-z\s]+)/gi,
      /ISBN[:\s]*(\d{10}|\d{13}|\d{9}[\dX])/gi,
      /(Harry Potter|Lord of the Rings|Pride and Prejudice|To Kill a Mockingbird|1984|The Great Gatsby|Jane Eyre|Wuthering Heights|The Catcher in the Rye|Of Mice and Men|Eragon|Twilight|The Hunger Games|Game of Thrones)/gi
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        if (pattern.source.includes('ISBN')) {
          return { isbn: match[1] };
        } else if (match[1] && match[2]) {
          return { title: match[1].trim(), author: match[2].trim() };
        } else if (match[1]) {
          return { title: match[1].trim() };
        }
      }
    }
    return null;
  }

  extractMultipleBookTitles(text) {
    const titles = [];

    const uxPsychologyBooks = [
      "Don't Make Me Think",
      'The Design of Everyday Things',
      'Thinking, Fast and Slow',
      'Nudge',
      'The Paradox of Choice',
      'Hooked',
      'About Face',
      'Universal Principles of Design'
    ];

    if (text.toLowerCase().includes('ux') && text.toLowerCase().includes('psychology')) {
      return uxPsychologyBooks.slice(0, 4);
    }

    if ((text.toLowerCase().includes('design') || text.toLowerCase().includes('ux')) &&
        (text.toLowerCase().includes('book') || text.toLowerCase().includes('recommend'))) {
      return uxPsychologyBooks.slice(0, 3);
    }

    const patterns = [
      /"([^"]+)"/g,
      /(?:book|novel|read)\s+([A-Z][^,!?.]*)/g
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].trim().length > 3) {
          titles.push(match[1].trim());
        }
      });
    }

    return [...new Set(titles)];
  }

  // =====================================================
  // BOOK COVER SEARCH (OpenLibrary API)
  // =====================================================
  async checkImageExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && contentType?.startsWith('image/');
    } catch {
      return false;
    }
  }

  async searchBookCover(bookInfo) {
    try {
      if (bookInfo.isbn) {
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(bookInfo.isbn)}-M.jpg`;
        if (await this.checkImageExists(coverUrl)) {
          return { coverUrl, title: bookInfo.title || 'Unknown', author: bookInfo.author || 'Unknown' };
        }
      }

      if (bookInfo.title) {
        const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(bookInfo.title)}&limit=1`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.docs && searchData.docs.length > 0) {
          const book = searchData.docs[0];
          const isbn = book.isbn ? book.isbn[0] : null;
          const olid = book.key ? book.key.replace('/works/', '') : null;

          const coverSources = [];
          if (isbn) coverSources.push(`https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-M.jpg`);
          if (olid) coverSources.push(`https://covers.openlibrary.org/b/olid/${encodeURIComponent(olid)}-M.jpg`);
          if (book.cover_i) coverSources.push(`https://covers.openlibrary.org/b/id/${encodeURIComponent(String(book.cover_i))}-M.jpg`);

          for (const coverUrl of coverSources) {
            if (await this.checkImageExists(coverUrl)) {
              return {
                coverUrl,
                title: book.title || bookInfo.title,
                author: book.author_name ? book.author_name[0] : (bookInfo.author || 'Unknown')
              };
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error searching for book cover:', error);
      return null;
    }
  }

  async searchMultipleBooks(bookTitles) {
    const results = [];

    for (const title of bookTitles) {
      const coverData = await this.searchBookCover({ title });
      if (coverData) {
        results.push(coverData);
      }
    }

    return results;
  }

  // =====================================================
  // SINGLE BOOK COVER DISPLAY
  // =====================================================
  showBookCover(coverData, headerText = 'Featured Book') {
    const display = document.getElementById('bookCoverDisplay');
    const header = document.getElementById('singleBookHeader');
    const loading = document.getElementById('bookCoverLoading');
    const image = document.getElementById('bookCoverImage');
    const title = document.getElementById('bookCoverTitle');
    const author = document.getElementById('bookCoverAuthor');

    if (!display || !header || !loading || !image || !title || !author) return;

    if (this.bookCoverTimeout) {
      clearTimeout(this.bookCoverTimeout);
    }

    header.textContent = headerText;
    loading.style.display = 'block';
    image.style.display = 'none';
    title.textContent = 'Loading...';
    author.textContent = '';
    display.classList.add('visible');

    const img = new Image();
    img.onload = () => {
      loading.style.display = 'none';
      loading.classList.add('u-hidden');
      image.src = coverData.coverUrl;
      image.alt = coverData.title;
      image.style.display = 'block';
      image.classList.remove('u-hidden');
      title.textContent = coverData.title;
      author.textContent = `by ${coverData.author}`;
    };

    img.onerror = () => {
      this.hideBookCover();
    };

    img.src = coverData.coverUrl;
    this.currentBookCover = coverData;

    this.bookCoverTimeout = setTimeout(() => {
      this.hideBookCover();
    }, 8000);
  }

  hideBookCover() {
    const display = document.getElementById('bookCoverDisplay');
    if (display) display.classList.remove('visible');
    this.currentBookCover = null;

    if (this.bookCoverTimeout) {
      clearTimeout(this.bookCoverTimeout);
      this.bookCoverTimeout = null;
    }
  }

  // =====================================================
  // MULTIPLE BOOKS DISPLAY
  // =====================================================
  showMultipleBookCovers(booksData, headerText = 'Recommended Books') {
    const display = document.getElementById('multipleBooksDisplay');
    const header = document.getElementById('booksHeader');
    const grid = document.getElementById('booksGrid');

    if (!display || !header || !grid) return;

    if (this.bookCoverTimeout) clearTimeout(this.bookCoverTimeout);

    header.textContent = headerText;

    // Clear existing items safely
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }

    // Build book items with DOM APIs (no innerHTML with dynamic data)
    booksData.forEach(book => {
      const bookItem = document.createElement('div');
      bookItem.className = 'book-item';

      const img = document.createElement('img');
      img.src = book.coverUrl;
      img.alt = book.title;

      const titleDiv = document.createElement('div');
      titleDiv.className = 'title';
      titleDiv.textContent = book.title;

      const authorDiv = document.createElement('div');
      authorDiv.className = 'author';
      authorDiv.textContent = `by ${book.author}`;

      bookItem.appendChild(img);
      bookItem.appendChild(titleDiv);
      bookItem.appendChild(authorDiv);
      grid.appendChild(bookItem);
    });

    display.classList.add('visible');
    this.currentMultipleBooks = booksData;

    this.bookCoverTimeout = setTimeout(() => this.hideMultipleBookCovers(), 12000);
  }

  hideMultipleBookCovers() {
    const display = document.getElementById('multipleBooksDisplay');
    if (display) display.classList.remove('visible');
    this.currentMultipleBooks = [];
    if (this.bookCoverTimeout) {
      clearTimeout(this.bookCoverTimeout);
      this.bookCoverTimeout = null;
    }
  }

  hideAllCovers() {
    this.hideBookCover();
    this.hideMultipleBookCovers();
  }

  // =====================================================
  // MAIN PROCESSING FUNCTION
  // =====================================================
  async processTextForBooks(text) {
    const bookTitles = this.extractMultipleBookTitles(text);

    if (bookTitles.length === 0) {
      const bookInfo = this.extractBookInfo(text);
      if (bookInfo) {
        const coverData = await this.searchBookCover(bookInfo);
        if (coverData) {
          this.showBookCover(coverData, 'Book Mention');
        }
      }
      return;
    }

    if (bookTitles.length === 1) {
      const coverData = await this.searchBookCover({ title: bookTitles[0] });
      if (coverData) {
        this.showBookCover(coverData, 'Recommended Book');
      }
    } else {
      const booksData = await this.searchMultipleBooks(bookTitles);
      if (booksData.length > 0) {
        let headerText = 'Recommended Books';
        if (text.toLowerCase().includes('ux') && text.toLowerCase().includes('psychology')) {
          headerText = 'UX Psychology Books';
        } else if (text.toLowerCase().includes('design')) {
          headerText = 'Design Books';
        }

        this.showMultipleBookCovers(booksData, headerText);
      }
    }
  }
}
