import { supabase } from "@/lib/supabaseClient";
import StoreProducts from "./StoreProducts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  payment_link: string;
  image_url: string;
  category?: string;
  average_rating?: number;
  review_count?: number;
};

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StorePageEn({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("store_slug", decodedSlug)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_slug", decodedSlug)
    .order("id", { ascending: false });

  const productIds = (products || []).map((product) =>
    String(product.id)
  );

  const { data: reviews } =
    productIds.length > 0
      ? await supabase
          .from("product_reviews")
          .select("product_id, rating")
          .in("product_id", productIds)
      : { data: [] };

  const productsWithRatings: Product[] = (products || []).map(
    (product) => {
      const productReviews = (reviews || []).filter(
        (review) =>
          String(review.product_id) === String(product.id)
      );

      const reviewCount = productReviews.length;

      const averageRating =
        reviewCount > 0
          ? productReviews.reduce(
              (total, review) =>
                total + Number(review.rating || 0),
              0
            ) / reviewCount
          : 0;

      return {
        ...product,
        average_rating: averageRating,
        review_count: reviewCount,
      };
    }
  );

  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-100"
    >
      <section className="relative bg-blue-600 text-white">
        {profile?.banner_url && (
          <img
            src={profile.banner_url}
            alt="Store banner"
            className="h-72 w-full object-cover"
          />
        )}

        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {profile?.logo_url && (
              <img
                src={profile.logo_url}
                alt="Store logo"
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow"
              />
            )}

            <div>
              <h1 className="text-5xl font-bold">
                {profile?.store_name || decodedSlug}
              </h1>

              <p className="mt-4 text-xl">
                {profile?.description ||
                  "Welcome to our store."}
              </p>

              {profile?.phone && (
                <p className="mt-3">
                  📞 {profile.phone}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-4">
                {profile?.website &&
                  profile.website !== "EMPTY" && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-600"
                    >
                      🌐 Website
                    </a>
                  )}

                {profile?.facebook &&
                  profile.facebook !== "EMPTY" && (
                    <a
                      href={profile.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-600"
                    >
                      📘 Facebook
                    </a>
                  )}

                {profile?.instagram &&
                  profile.instagram !== "EMPTY" && (
                    <a
                      href={profile.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-600"
                    >
                      📷 Instagram
                    </a>
                  )}

                {profile?.tiktok &&
                  profile.tiktok !== "EMPTY" && (
                    <a
                      href={profile.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-600"
                    >
                      🎵 TikTok
                    </a>
                  )}

                {profile?.youtube &&
                  profile.youtube !== "EMPTY" && (
                    <a
                      href={profile.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-600"
                    >
                      ▶ YouTube
                    </a>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl p-10">
        <h2 className="mb-8 text-3xl font-bold">
          Products
        </h2>

        {productsWithRatings.length === 0 && (
          <p>No products have been added yet.</p>
        )}

        <StoreProducts
          products={productsWithRatings}
          slug={decodedSlug}
        />
      </section>
    </main>
  );
}
