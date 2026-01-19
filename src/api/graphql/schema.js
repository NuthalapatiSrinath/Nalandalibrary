// src/api/graphql/schema.js
const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    ISBN: String!
    publicationDate: String
    genre: String!
    copies: Int!
    availableCopies: Int
  }

  type BorrowingRecord {
    id: ID!
    book: Book!
    member: User!
    borrowDate: String!
    returnDate: String
    status: String!
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
  }

  type BookReport {
      bookTitle: String!
      count: Int!
  }

  type RootQuery {
    # Public
    books(page: Int, limit: Int, genre: String): [Book!]!
    
    # Member & Admin
    myHistory: [BorrowingRecord!]!
    
    # Admin Only (Aggregations)
    mostBorrowedBooks: [BookReport!]!
  }

  type RootMutation {
    # Auth
    register(userInput: RegisterInput): User!
    login(email: String!, password: String!): AuthData!

    # Book Management (Admin Only)
    createBook(bookInput: BookInput): Book!
    updateBook(id: ID!, bookInput: BookInput): Book!
    deleteBook(id: ID!): Boolean!

    # Borrowing System
    borrowBook(bookId: ID!): BorrowingRecord!
    returnBook(bookId: ID!): BorrowingRecord!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input BookInput {
    title: String!
    author: String!
    ISBN: String!
    publicationDate: String!
    genre: String!
    copies: Int!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
