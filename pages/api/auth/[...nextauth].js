import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

const options = {
//   providers: [
//     Providers.Google({
//       clientId: process.env.GOOGLE_ID,
//       clientSecret: process.env.GOOGLE_SECRET
//     }),
//   ],
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize (credentials, req) {
        if (typeof credentials !== "undefined") {
          const res = await authenticate(credentials.email, credentials.password)
          if (typeof res !== "undefined") {
            return { ...res.user, apiToken: res.token }
          } else {
            return null
          }
        } else {
          return null
        }
      }
    })
  ],
  debug: false
}

export default (req, res) => NextAuth(req, res, options)