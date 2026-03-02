import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export function proxy(req){
    const token = getToken({ 
        req, 
        secret: process.env.AUTH_SECRET,
    });

     const pathname = req.nextUrl;

    if(!token){
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", `${pathname}`);
        return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/profile"],
};