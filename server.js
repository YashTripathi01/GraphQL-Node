const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { books, authors } = require("./data");
const {
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt,
    GraphQLString,
} = require("graphql");

const app = express();

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book written by an author",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find((author) => author.id === book.authorId);
            },
        },
    }),
});

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents an author of a book",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter((book) => book.authorId === author.id);
            },
        },
    }),
});

// ROOT QUERY (GET)
const rootQueryObject = new GraphQLObjectType({
    name: "Query",
    description: "Root query",
    fields: () => ({
        book: {
            type: BookType,
            description: "A single book",
            args: {
                id: { type: GraphQLInt },
            },
            resolve: (parent, args) =>
                books.find((book) => book.id === args.id),
        },
        books: {
            type: new GraphQLList(BookType),
            description: "List of books",
            resolve: () => books,
        },
        author: {
            type: AuthorType,
            description: "A single author",
            args: {
                id: { type: GraphQLInt },
            },
            resolve: (parent, args) =>
                authors.find((author) => author.id === args.id),
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of authors",
            resolve: () => authors,
        },
    }),
});

// ROOT QUERY (POST)
const rootMutationObject = new GraphQLObjectType({
    name: "Mutation",
    description: "Root mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a new book",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId,
                };
                books.push(book);
                return book;
            },
        },

        addAuthor: {
            type: AuthorType,
            description: "Add a new author",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name,
                };
                authors.push(author);
                return author;
            },
        },
    }),
});

const schema = new GraphQLSchema({
    query: rootQueryObject,
    mutation: rootMutationObject,
});

app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        graphiql: true,
    })
);

app.listen(3000, () => {
    console.log(`The server is running on http://localhost:3000`);
});

// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: "HelloWorld",
//         fields: () => ({
//             message: { type: GraphQLString, resolve: () => "hello world" },
//         }),
//     }),
// });
