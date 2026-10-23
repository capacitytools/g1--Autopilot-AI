"use client";

import { useState } from "react";
import { addAffiliateProduct } from "@/lib/monetization-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function MonetizationManager({ products }: { products: any[] }) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddProduct(formData: FormData) {
    setAdding(true);
    setError(null);
    const result = await addAffiliateProduct(formData);
    if (result.error) setError(result.error);
    setAdding(false);
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Add Product Form */}
      <div className="md:col-span-1">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Add Affiliate Product</h2>
          <form action={handleAddProduct} className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <Input label="Product Name" name="name" placeholder="e.g., Goat Feed Guide" required />
            <Input label="Platform" name="platform" placeholder="e.g., Amazon, ClickBank" />
            <Input label="Affiliate URL" name="url" placeholder="https://..." required />
            
            <Button type="submit" loading={adding} className="w-full">
              Add Product
            </Button>
          </form>
        </div>
      </div>

      {/* Product List */}
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-lg font-semibold">Your Products</h2>
        
        {products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-sm text-ink-muted">No affiliate products added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const links = product.affiliate_links as any[] || [];
              const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
              const totalRevenue = links.reduce((sum, link) => sum + Number(link.revenue || 0), 0);

              return (
                <div key={product.id} className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium text-ink">{product.name}</h3>
                    <p className="text-xs text-ink-subtle mt-1">{product.platform || "Direct Affiliate"}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-ink-subtle text-xs">Clicks</p>
                      <p className="font-semibold">{totalClicks}</p>
                    </div>
                    <div>
                      <p className="text-ink-subtle text-xs">Revenue</p>
                      <p className="font-semibold text-green-600">${totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}