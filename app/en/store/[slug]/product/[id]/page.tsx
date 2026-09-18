"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  payment_link: string;
  image_url?: string;
  store_slug: string;
  owner_id: string;
  stock: number;
  has_variants: boolean;
  variant_name?: string;
  variant_values?: string[];
};

type ProductImage = {
  id: number;
  product_id: string;
  image_url: string;
  sort_order: number;
};
type ProductReview = {
  id: number;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};
export default function ProductDetailsPage() {
const params = useParams();
const slug = decodeURIComponent(params.slug as string);
const id = params.id as string;
const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerEmail, setSellerEmail] = useState("");
  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] =
    useState("Наложен платеж");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [message, setMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
const [reviews, setReviews] = useState<ProductReview[]>([]);
const [reviewName, setReviewName] = useState("");
const [reviewRating, setReviewRating] = useState(5);
const [reviewComment, setReviewComment] = useState("");
const [reviewMessage, setReviewMessage] = useState("");
async function sendOrderEmail(
  to: string,
  subject: string,
  message: string
) {
  const response = await fetch("/api/send-order-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      subject,
      message,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Имейлът не беше изпратен:", result);

    throw new Error(
      result.error || "Неуспешно изпращане на имейла."
    );
  }

  console.log("Имейлът е изпратен:", result);
}
  useEffect(() => {
    loadProduct();
  }, [id, slug]);
async function sendSellerEmail(
  sellerEmail: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  customerAddress: string,
  productName: string,
  quantity: number,
  totalPrice: number
) {
  const response = await fetch("/api/send-order-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: sellerEmail,
      subject: "Нова поръчка във Vendora",
      title: "Получихте нова поръчка",
      message: `
Клиент: ${customerName}
Имейл: ${customerEmail}
Телефон: ${customerPhone}
Адрес: ${customerAddress}
Продукт: ${productName}
Количество: ${quantity}
Обща сума: ${totalPrice.toFixed(2)} €
      `,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Имейлът към продавача не беше изпратен.");
  }

  console.log("Имейлът към продавача е изпратен:", result);
}
  async function loadProduct() {
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("store_slug", slug)
      .single();

    if (productError) {
      console.error(productError);
      return;
    }

    if (!productData) return;

    setProduct(productData);
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("id, email")
  .eq("id", productData.owner_id)
  .single();

console.log("owner_id на продукта:", productData.owner_id);
console.log("Профил:", JSON.stringify(profile, null, 2));
console.log("Грешка при профила:", profileError);
console.log("ID:", profile?.id);
console.log("Email:", profile?.email);
if (profile?.email) {
  setSellerEmail(profile.email);
}
console.log("Имейл на продавача:", profile?.email);
    setSelectedImage(productData.image_url || "");

    if (
      productData.has_variants &&
      productData.variant_values?.length > 0
    ) {
      setSelectedVariant(productData.variant_values[0]);
    } else {
      setSelectedVariant("Стандартен");
    }

    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", String(productData.id))
      .order("sort_order", { ascending: true });

    if (imagesError) {
      console.error(imagesError);
      return;
    }

  setGalleryImages(imagesData || []);

const { data: reviewsData, error: reviewsError } = await supabase
  .from("product_reviews")
  .select("*")
  .eq("product_id", String(productData.id))
  .order("created_at", { ascending: false });

if (reviewsError) {
  console.error(reviewsError);
  return;
}

setReviews(reviewsData || []);
}
  function showPreviousImage() {
    const allImages = [
      ...(product?.image_url ? [product.image_url] : []),
      ...galleryImages.map((image) => image.image_url),
    ];

    if (allImages.length === 0) return;

    const currentIndex = allImages.indexOf(selectedImage);
    const previousIndex =
      currentIndex <= 0 ? allImages.length - 1 : currentIndex - 1;

    setSelectedImage(allImages[previousIndex]);
  }

  function showNextImage() {
    const allImages = [
      ...(product?.image_url ? [product.image_url] : []),
      ...galleryImages.map((image) => image.image_url),
    ];

    if (allImages.length === 0) return;

    const currentIndex = allImages.indexOf(selectedImage);
    const nextIndex =
      currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;

    setSelectedImage(allImages[nextIndex]);
  }
function handleAddToCart() {
  if (!product) return;

  addToCart({
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    imageUrl: selectedImage || product.image_url,
    quantity,
    variant: selectedVariant,
    storeSlug: product.store_slug,
    ownerId: product.owner_id,
  });

  router.push("/en/cart");
}
async function submitOrder(e: React.FormEvent) {
  e.preventDefault();

  if (!product) return;

  if (
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !address ||
    !city
  ) {
   setMessage("Please fill in all required fields.");
    return;
  }

  const { error } = await supabase.from("orders").insert([
    {
      owner_id: product.owner_id,
      product_id: product.id,
      product_name: product.name,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      address,
      city,
      postal_code: postalCode,
      quantity,
      variant: selectedVariant,
      payment_method: paymentMethod,
      status: "Нова",
    },
  ]);

 if (error) {
  console.error(error);
  setMessage("There was an error submitting the order.");
  return;
}
const paymentMethodLabel =
  paymentMethod === "Банков превод"
    ? "Bank transfer"
    : paymentMethod === "Наложен платеж"
      ? "Cash on delivery"
      : paymentMethod;
try {
await sendOrderEmail(
  customerEmail,
  "Order confirmation",
  `Hello, ${customerName}!

Thank you for your order.

Product: ${product.name}
Quantity: ${quantity}
Total: ${(Number(product.price) * quantity).toFixed(2)} €
Payment method: ${paymentMethodLabel}

You will receive another email when the order status changes.

Best regards,
Vendora`
);
if (sellerEmail) {
  await sendSellerEmail(
    sellerEmail,
    customerName,
    customerEmail,
    customerPhone,
    address,
    product.name,
    quantity,
    Number(product.price) * quantity
  );
}
 setMessage("Your order has been submitted successfully.");
} catch (emailError) {
  console.error(emailError);

setMessage(
  "Your order was saved, but the confirmation email could not be sent."
);
}

setShowOrderForm(false);
}
async function submitReview(e: React.FormEvent) {
  e.preventDefault();

  if (!product) return;

  if (!reviewName.trim() || !reviewComment.trim()) {
    setReviewMessage("Please enter your name and comment.");
    return;
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .insert([
      {
        product_id: product.id,
        customer_name: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error(error);
   setReviewMessage("There was an error submitting your review.");
    return;
  }

  setReviews((currentReviews) => [data, ...currentReviews]);
  setReviewName("");
  setReviewRating(5);
  setReviewComment("");
 setReviewMessage("Your review has been published successfully.");
}

  if (!product) {
   return (
  <main lang="en" className="p-10">
    Loading...
  </main>
);
  }

  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...galleryImages.map((image) => image.image_url),
  ];
const averageRating =
  reviews.length > 0
    ? reviews.reduce(
        (total, review) => total + Number(review.rating),
        0
      ) / reviews.length
    : 0;
  return (
    <main
  lang="en"
  className="min-h-screen bg-gray-100 p-10"
>
      <div className="mx-auto grid max-w-5xl gap-10 rounded-2xl bg-white p-8 shadow md:grid-cols-2">
        <div>
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt={product.name}
                className="h-96 w-full rounded-xl object-cover"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl shadow"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl shadow"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          ) : (
           <div className="flex h-96 items-center justify-center rounded-xl bg-gray-200 text-gray-500">
  No image
</div>
          )}

          {allImages.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {allImages.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(imageUrl)}
                  className={`overflow-hidden rounded-lg border-2 ${
                    selectedImage === imageUrl
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold">{product.name}</h1>

          <p className="mt-4 text-3xl font-bold text-blue-600">
            € {product.price}
          </p>

         {product.stock > 0 ? (
  <p className="mt-3 font-semibold text-green-600">
    ✔ In stock: {product.stock}
  </p>
) : (
  <p className="mt-3 font-semibold text-red-600">
    ❌ Out of stock
  </p>
)}

          <p className="mt-6 text-gray-600">{product.description}</p>

          <label className="mt-8 block font-semibold">
            {product.has_variants
  ? product.variant_name
  : "Variant"}
          </label>

          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="mt-2 w-full rounded-lg border p-3"
          >
            {product.has_variants &&
            product.variant_values?.length ? (
              product.variant_values.map((value) => (
                <option key={value}>{value}</option>
              ))
            ) : (
            <option value="Стандартен">Standard</option>
            )}
          </select>

         <label className="mt-5 block font-semibold">
  Quantity
</label>

          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.max(
                  1,
                  Math.min(
                    Number(e.target.value),
                    product.stock || 1
                  )
                )
              )
            }
            className="mt-2 w-full rounded-lg border p-3"
          />

       <label className="mt-5 block font-semibold">
  Payment method
</label>

         <select
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
  className="mt-2 w-full rounded-lg border p-3"
>
  <option>Stripe</option>
  <option>PayPal</option>
  <option>Revolut</option>
 <option value="Банков превод">Bank transfer</option>
<option value="Наложен платеж">Cash on delivery</option>
</select>
{paymentMethod === "Stripe" && (
  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
  <h3 className="font-semibold text-blue-700">
  💳 Pay with Stripe
</h3>
<p className="mt-2 text-sm text-gray-700">
  You will be redirected to Stripe&apos;s secure checkout page to pay safely by card.
</p>
  </div>
)}

{paymentMethod === "PayPal" && (
  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
  <h3 className="font-semibold text-blue-700">
  🟦 Pay with PayPal
</h3>
<p className="mt-2 text-sm text-gray-700">
  You will be redirected to PayPal to complete your payment.
</p>
  </div>
)}

{paymentMethod === "Revolut" && (
  <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
  <h3 className="font-semibold text-purple-700">
  💜 Pay with Revolut
</h3>
<p className="mt-2 text-sm text-gray-700">
  You will be redirected to Revolut to complete your payment securely.
</p>
  </div>
)}

{paymentMethod === "Банков превод" && (
  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
    <h3 className="font-semibold text-green-700">
      🏦 Bank transfer
    </h3>
   <p className="mt-2 text-sm text-gray-700">
  After confirming the order, you will receive the seller&apos;s bank details.
</p>
  </div>
)}

{paymentMethod === "Наложен платеж" && (
  <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
    <h3 className="font-semibold text-orange-700">
      🚚 Cash on delivery
    </h3>
   <p className="mt-2 text-sm text-gray-700">
  Payment will be made when the order is delivered.
</p>
  </div>
)}

          {product.stock > 0 ? (
<div className="mt-8 grid gap-3">
  

  <button
    type="button"
    onClick={handleAddToCart}
    className="block w-full rounded-lg bg-blue-600 py-4 text-center text-white"
  >
    🛒 Add to cart
  </button>
</div>
          ) : (
            <button
              disabled
              className="mt-8 block w-full cursor-not-allowed rounded-lg bg-gray-400 py-4 text-center text-white"
            >
              ❌ Out of stock
            </button>
          )}

          {message && (
            <p className="mt-4 font-semibold">{message}</p>
          )}
        </div>
      </div>

      {showOrderForm && (
        <form
          onSubmit={submitOrder}
          className="mx-auto mt-8 max-w-5xl rounded-2xl bg-white p-8 shadow"
        >
          <h2 className="mb-6 text-3xl font-bold">
           Order details
          </h2>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Full name"
            className="mb-4 w-full rounded-lg border p-3"
          />

          <input
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email"
            className="mb-4 w-full rounded-lg border p-3"
          />

          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone"
            className="mb-4 w-full rounded-lg border p-3"
          />

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="mb-4 w-full rounded-lg border p-3"
          />

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="mb-4 w-full rounded-lg border p-3"
          />

          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Postal code"
            className="mb-6 w-full rounded-lg border p-3"
          />

          <button className="w-full rounded-lg bg-green-600 py-4 text-white">
           Place order
          </button>
        </form>
      )}
      <section className="mx-auto mt-8 max-w-5xl rounded-2xl bg-white p-8 shadow">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 className="text-3xl font-bold">⭐ Reviews and ratings</h2>

      {reviews.length > 0 ? (
        <p className="mt-3 text-lg">
          <span className="text-2xl text-yellow-500">
            {"★".repeat(Math.round(averageRating))}
            {"☆".repeat(5 - Math.round(averageRating))}
          </span>

          <span className="ml-3 font-semibold">
           {averageRating.toFixed(1)} out of 5
          </span>

          <span className="ml-2 text-gray-500">
            ({reviews.length} ratings)
          </span>
        </p>
      ) : (
        <p className="mt-3 text-gray-500">
         No reviews have been published yet. 
        </p>
      )}
    </div>
  </div>

  <form
    onSubmit={submitReview}
    className="mt-8 rounded-xl bg-gray-50 p-6"
  >
    <h3 className="text-2xl font-bold">Leave a review</h3>

    <label className="mt-5 block font-semibold">Your name</label>

    <input
      value={reviewName}
      onChange={(e) => setReviewName(e.target.value)}
      placeholder="Name"
      className="mt-2 w-full rounded-lg border p-3"
    />

    <label className="mt-5 block font-semibold">Rating</label>

    <select
      value={reviewRating}
      onChange={(e) => setReviewRating(Number(e.target.value))}
      className="mt-2 w-full rounded-lg border p-3"
    >
    <option value={5}>★★★★★ — Excellent</option>
<option value={4}>★★★★☆ — Very good</option>
<option value={3}>★★★☆☆ — Good</option>
<option value={2}>★★☆☆☆ — Poor</option>
<option value={1}>★☆☆☆☆ — Bad</option>
    </select>

    <label className="mt-5 block font-semibold">Comment</label>

    <textarea
      value={reviewComment}
      onChange={(e) => setReviewComment(e.target.value)}
      placeholder="Write your review..."
      className="mt-2 h-32 w-full rounded-lg border p-3"
    />

    <button
      type="submit"
      className="mt-5 w-full rounded-lg bg-yellow-500 py-4 font-semibold text-white"
    >
      ⭐ Submit review
    </button>

    {reviewMessage && (
      <p className="mt-4 font-semibold">{reviewMessage}</p>
    )}
  </form>

  <div className="mt-8 grid gap-5">
    {reviews.map((review) => (
      <article
        key={review.id}
        className="rounded-xl border p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-bold">{review.customer_name}</p>

            <p className="mt-1 text-xl text-yellow-500">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </p>
          </div>

          <p className="text-sm text-gray-500">
            {new Date(review.created_at).toLocaleDateString("en-GB")}
          </p>
        </div>

        <p className="mt-4 text-gray-700">{review.comment}</p>
      </article>
    ))}
  </div>
</section>
    </main>
  );
}
