import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { supabaseRequest } from "@/lib/supabase";
import { AdminDashboard } from "@/components/admin-dashboard";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin flight deck", robots: { index: false, follow: false } };
type Product = { id: string; title: string; slug: string; price: number; status: string; release_at: string | null; file_path: string | null };
export default async function AdminPage() { const admin = await getAdmin(); if (!admin) redirect("/admin/login"); const [products, orders, leads, waitlist] = await Promise.all([supabaseRequest<Product[]>("/rest/v1/playbooks?select=id,title,slug,price,status,release_at,file_path&order=created_at.asc"), supabaseRequest<{ amount: number; status: string }[]>("/rest/v1/orders?select=amount,status"), supabaseRequest<{ id: string }[]>("/rest/v1/leads?select=id"), supabaseRequest<{ id: string }[]>("/rest/v1/waitlist?select=id")]); const paid = orders.filter((order) => order.status === "paid"); return <AdminDashboard initialProducts={products} email={admin.email} metrics={{ orders: paid.length, revenue: paid.reduce((sum, order) => sum + order.amount, 0), leads: leads.length, waitlist: waitlist.length }} />; }
