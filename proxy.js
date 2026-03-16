import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req){
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
    });

     const pathname = req.nextUrl.pathname;


    if(!token){
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", `${pathname}`);
        return NextResponse.redirect(loginUrl);
    }

    if (token.IsOnboarded === false && pathname !== "/onboard"){
        const onboardUrl = new URL("/onboard", req.url);
        return NextResponse.redirect(onboardUrl);
    }

    if (token.IsOnboarded === true && pathname !== "/dashboard"){
        const dashboard = new URL("/dashboard", req.url);
        return NextResponse.redirect(dashboard);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/profile", "/onboard"],
};