-- Fix security issue: Restrict product_variants table access to authenticated users only
-- Previously, anyone could view sensitive data like cost prices and stock quantities

-- Drop the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Anyone can view active product variants" ON public.product_variants;

-- Create a new policy that only allows authenticated users to view product variants
CREATE POLICY "Authenticated users can view product variants" 
ON public.product_variants
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create a public view for product variants that excludes sensitive data
-- This can be used for public-facing features like the store
CREATE OR REPLACE VIEW public.product_variants_public AS
SELECT 
  id,
  product_id,
  sku,
  size,
  color,
  ean_code,
  price,
  is_active,
  -- Exclude sensitive fields: cost_price, stock_quantity, internal_code, manufacturer_code, min_stock
  -- Only show if in stock, not the exact quantity
  CASE WHEN stock_quantity > 0 THEN true ELSE false END as in_stock
FROM public.product_variants
WHERE is_active = true;

-- Grant public access to the view
GRANT SELECT ON public.product_variants_public TO anon;
GRANT SELECT ON public.product_variants_public TO authenticated;

-- Add comment to document the security measure
COMMENT ON VIEW public.product_variants_public IS 'Public view of product variants that excludes sensitive business data like cost prices and exact stock quantities';