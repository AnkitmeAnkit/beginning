import type { Metadata } from "next";
import Link from "next/link";
import { AdminLogin } from "@/components/admin-login";
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export default function AdminLoginPage() { return <main className="admin-login-page"><Link className="brand" href="/"><span className="brand-mark">e</span><span>echoglitch</span></Link><AdminLogin /></main>; }
