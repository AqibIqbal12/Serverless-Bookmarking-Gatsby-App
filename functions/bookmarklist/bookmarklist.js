const { ApolloServer, gql } = require('apollo-server-lambda')
var faunadb = require('faunadb'),
  q = faunadb.query;

const typeDefs = gql`
  type Query {
    bookmarks: [Bookmark]
  }
  type Bookmark {
    id: ID!
    title: String!
    url: String!
  }
  type Mutation {
    addBookmark(title: String!, url: String!): Bookmark
  }
`

const resolvers = {
  Query: {
    bookmarks: async (root, args, context) => {
      try {
        var adminClient = new faunadb.Client({ secret: process.env.faunadbKey });
        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index('all_urls'))),
            q.Lambda(x => q.Get(x))
          )
        )
        
        return result.data.map(d => {
          return {
            id: d.ref.id,
            title: d.data.title,
            url: d.data.url
          }
        })

      } catch (err) {
        console.log(err);
      }
    }
  },
  Mutation: {
    addBookmark: async (_, { title, url }) => {
      try {
        var adminClient = new faunadb.Client({ secret: process.env.faunadbKey });

        const result = await adminClient.query(
          q.Create(
            q.Collection('bookmarks'),
            {
              data: {
                title,
                url
              }
            },
          )
        )
    
        return {
        id: result.ref.id,
        }
      }
      catch (err) {
        console.log(err)
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

exports.handler = server.createHandler()
