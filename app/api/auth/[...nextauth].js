import { LoginCredentials, LoginProvider } from "@/app/Services/UserService";
import NextAuth from "next-auth"
import { jwtDecode } from "jwt-decode"
import CredentialsProvider from "next-auth/providers/*";
import { RefreshToken } from "@/app/Services/UserService";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
    session: {
        strategy: "jwt"
    },
    secret: process.env.AUTH_SECRET,

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const data = await LoginCredentials(credentials);

                if (!data?.accessToken || !data?.refreshToken) return null;

                const decoded = jwtDecode(data.accessToken);

                const user = {
                    id: decoded.sub,
                    name: decoded.name,
                    email: decoded.email,
                    expiracy: decoded.exp
                };

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    accessTokenExpiresAt: user.expiracy
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
        })
    ],

    async jwt({ token, user, account }) {
        if (account?.provider === "credentials" && user){
            token.user = {
                id: user.id,
                email: user.email,
                name: user.name,
            };
            token.accessToken = user.accessToken,
            token.refreshToken = user.refreshToken,
            token.accessTokenExpiresAt = user.accessTokenExpiresAt,
            token.error = undefined;
            return token;
        }

        if (account && account.provider !== "credentials"){
            const data = await LoginProvider({
                idToken: account.id_token,
                accessToken: account.access_token,
                provider: account.provider,
            });

            if (!data?.accessToken || !data?.user) {
                token.error = "OAuth backend exchange failed"
                return token;
            }

            token.user = {
                email: data.user.email,
                name: data.user.name,
            };
            token.accessToken = data.accessToken;
            token.refreshToken = data.refreshToken;
            token.accessTokenExpiresAt = data.accessTokenExpiresAt;
            token.error = undefined;
            return token;
        }

        const expiresAt = token.accessTokenExpiresAt 
            ? new Date(token.accessTokenExpiresAt).getTime()
            : 0;
        
        if (expiresAt > Date.now()){
            return token;
        }

        if (token.refreshToken){
            const request = await RefreshToken(token.refreshToken);

            const decoded = jwtDecode(request.accessToken);

            const refreshed = {
                expiracy: decoded.exp
            }

            if (refreshed?.accessToken){
                token.accessToken = request.accessToken;
                token.refreshToken = request.refreshToken;
                token.accessTokenExpiresAt = refreshed.expiracy;
                token.error = undefined;
                return token;
            }
        }

        token.error = "Refresh token error"
        return token;
    },

    async session({ session, token }){
        session.user = token.user || session.user;
        session.accessToken = token.accessToken;
        session.error = token.error;
        return session;
    }
}

export default NextAuth(authOptions);