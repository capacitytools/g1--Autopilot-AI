import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { Metadata } from "next";
import { MonetizationManager } from "@/lib/MonetizationManager";

export const metadata: Metadata = {
  title: "Monetization Hub",
};

export default async function MonetizationPage() {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch products and their aggregated links
  const { data: products } = await supabase
    .from("affiliate_products")
    .select(`
      id, name, platform, created_at,
      affiliate_links (clicks, conversions, revenue)
    `)
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });

  // Calculate total revenue
  let totalRevenue = 0;
  products?.forEach(product => {
    const links = product.affiliate_links as any[];
    links?.forEach(link => {
      totalRevenue += Number(link.revenue || 0);
    });
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monetization Hub</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your affiliate products and track real revenue.
          </p>
        </div>
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 text-right">
          <p className="text-sm text-brand-800 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-brand-900">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      <MonetizationManager products={products || []} />
    </div>
  );
}