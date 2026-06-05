import { create } from 'zustand';
import { Book } from '../types';

interface BookState {
  books: Book[];
  activeBookId: string | null;
  isBookOpen: boolean;
  
  registerBook: (book: Book) => void;
  registerBooks: (books: Book[]) => void;
  openBook: (id: string) => void;
  closeBook: () => void;
}

export const useBookStore = create<BookState>((set) => ({
  books: [],
  activeBookId: null,
  isBookOpen: false,

  registerBook: (book) => set((state) => ({
    books: state.books.some(b => b.id === book.id) 
      ? state.books.map(b => b.id === book.id ? book : b)
      : [...state.books, book]
  })),

  registerBooks: (newBooks) => set((state) => {
    const existingIds = new Set(state.books.map(b => b.id));
    const filteredNew = newBooks.filter(b => !existingIds.has(b.id));
    return { books: [...state.books, ...filteredNew] };
  }),

  openBook: (id) => set({ activeBookId: id, isBookOpen: true }),
  closeBook: () => set({ activeBookId: null, isBookOpen: false }),
}));
