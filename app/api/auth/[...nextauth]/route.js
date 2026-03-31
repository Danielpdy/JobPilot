import { LoginCredentials, LoginProvider } from "@/app/Services/UserService";
import NextAuth from "next-auth";

import { jwtDecode } from "jwt-decode";
import CredentialsProvider from "next-auth/providers/credentials";
import { RefreshToken } from "@/app/Services/UserService";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let data;

        try {
          data = await LoginCredentials(credentials);
        } catch (err) {
          return null;
        }

        if (!data?.token?.accessToken || !data?.token?.refreshToken)
          return null;

        const decoded = jwtDecode(data.token.accessToken);

        const user = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          expiracy: decoded.exp,
        };

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          accessToken: data.token.accessToken,
          refreshToken: data.token.refreshToken,
          accessTokenExpiresAt: user.expiracy,
          IsOnboarded: data.token.isOnboarded,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if(trigger === "update" && session?.IsOnboarded !== undefined){
        token.IsOnboarded = session.IsOnboarded;
        return token;
      }
      
      if (account?.provider === "credentials" && user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
        };
        ((token.accessToken = user.accessToken),
          (token.refreshToken = user.refreshToken),
          (token.accessTokenExpiresAt = user.accessTokenExpiresAt),
          (token.IsOnboarded = user.IsOnboarded),
          (token.error = undefined));
        return token;
      }

      if (account && account.provider !== "credentials") {
        const data = await LoginProvider({
          idToken: account.id_token,
          accessToken: account.access_token,
          provider: account.provider,
        });

        if (!data?.token?.accessToken) {
          token.error = "OAuth backend exchange failed";
          return token;
        }

        const decoded = jwtDecode(data.token.accessToken);

        const user = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          expiracy: decoded.exp,
        };

        token.user = {
          email: user.email,
          name: user.name,
        };
        token.accessToken = data.token.accessToken;
        token.refreshToken = data.token.refreshToken;
        token.accessTokenExpiresAt = user.expiracy;
        token.IsOnboarded = data.token.isOnboarded;
        token.error = undefined;
        return token;
      }

      const expiresAt = token.accessTokenExpiresAt
        ? token.accessTokenExpiresAt * 1000
        : 0;

      if (expiresAt > Date.now()) {
        return token;
      }

      if (token.refreshToken) {
        try {
          const request = await RefreshToken(token.refreshToken);

          if (request?.token?.accessToken) {
            const decoded = jwtDecode(request.token.accessToken);
            const refreshed = {
              expiracy: decoded.exp,
            };

            token.accessToken = request.token.accessToken;
            token.refreshToken = request.token.refreshToken;
            token.accessTokenExpiresAt = refreshed.expiracy;
            token.error = undefined;
            return token;
          }
        } catch {
          token.accessToken = undefined;
          token.error = "Refresh token error";
        }

        return token;
      }
    },

    async session({ session, token }) {
      session.user = token.user || session.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.IsOnboarded = token.IsOnboarded;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
