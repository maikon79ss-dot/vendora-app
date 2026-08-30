"use client";
import EcontDeliveryPicker, {
  type EcontSelection,
} from "./components/EcontDeliveryPicker";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import Badge from "./components/ui/Badge";
type Product = {
  category?: string;
  id: string;
  name: string;
  price: string;
  stock: number;
  description: string;
  payment_link: string;
  image_url?: string;
  owner_id?: string;
  store_slug?: string;
  product_type?: string;
  has_variants?: boolean;
  variant_name?: string;
  variant_values?: string[];
};

export default function Products() {
  const router = useRouter();
const [deliveryMethod, setDeliveryMethod] = useState("Наложен платеж");
  const [econtSelection, setEcontSelection] =
  useState<EcontSelection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productType, setProductType] = useState("physical");
  const [category, setCategory] = useState("Без категория");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
const [defaultPaymentLink, setDefaultPaymentLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
const [searchTerm, setSearchTerm] = useState("");
const [categoryFilter, setCategoryFilter] = useState("Всички категории");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const copyStoreLink = async () => {
  if (!storeSlug) return;

  const storeUrl = `${window.location.origin}/store/${storeSlug}`;

  await navigator.clipboard.writeText(storeUrl);

  alert("✅ Линкът на магазина е копиран.");
};
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [editingId, setEditingId] = useState<string | null>(null);
const [typeFilter, setTypeFilter] = useState("Всички");
  const [hasVariants, setHasVariants] = useState(false);
  const [variantName, setVariantName] = useState("");
  const [variantValues, setVariantValues] = useState("");
const [sortBy, setSortBy] = useState("Най-нови");
const [currentPage, setCurrentPage] = useState(1);
const productsPerPage = 10;
const indexOfLastProduct = currentPage * productsPerPage;
const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

const filteredProducts = products
  .filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .filter((product) =>
    categoryFilter === "Всички категории"
      ? true
      : (product.category || "Без категория") === categoryFilter
  )
  .filter((product) =>
    typeFilter === "Всички"
      ? true
      : typeFilter === "📦 Физически"
        ? product.product_type !== "digital"
        : product.product_type === "digital"
  )
  .sort((a, b) => {
    if (sortBy === "Цена ↑") return Number(a.price) - Number(b.price);
    if (sortBy === "Цена ↓") return Number(b.price) - Number(a.price);
    if (sortBy === "Азбучен ред") return a.name.localeCompare(b.name);
    return 0;
  });

const currentProducts = filteredProducts.slice(
  indexOfFirstProduct,
  indexOfLastProduct
);

const totalPages = Math.ceil(
  filteredProducts.length / productsPerPage
);
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const currentUserId = session.user.id;
    const currentStoreSlug =
      session.user.user_metadata.store_slug || "my-store";

    setUserId(currentUserId);
    setStoreSlug(currentStoreSlug);
const { data: profile } = await supabase
  .from("profiles")
  .select("default_payment_link, subscription_plan")
  .eq("id", currentUserId)
  .single();

if (profile?.default_payment_link) {
  setDefaultPaymentLink(profile.default_payment_link);
  setPaymentLink(profile.default_payment_link);
}
setSubscriptionPlan(profile?.subscription_plan || "free");
    await loadProducts(currentUserId);
  }

  async function loadProducts(currentUserId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("owner_id", currentUserId)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Грешка при зареждане на продуктите.");
      return;
    }

    setProducts(data || []);
  }

async function uploadImage() {
  if (!imageFile) return "";

  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, imageFile);

  if (error) throw error;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

async function uploadGalleryImages(productId: string) {
  if (galleryFiles.length === 0) return;

  for (let index = 0; index < galleryFiles.length; index++) {
    const file = galleryFiles[index];
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}-${Date.now()}-${index}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const { error: imageRowError } = await supabase
      .from("product_images")
      .insert([
        {
          product_id: productId,
          image_url: publicUrlData.publicUrl,
          sort_order: index,
        },
      ]);

    if (imageRowError) {
      console.error(imageRowError);
      throw imageRowError;
    }
  }
}

  function resetForm() {
    setProductType("physical");
    setName("");
    setPrice("");
    setStock("1");
    setDescription("");
    setPaymentLink(defaultPaymentLink);
    setImageFile(null);
    setGalleryFiles([]);
    setHasVariants(false);
    setVariantName("");
    setVariantValues("");
    setEditingId(null);
  }

  async function addOrUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
const isPremium =
  subscriptionPlan === "premium_monthly" ||
  subscriptionPlan === "premium_yearly";

if (!editingId && !isPremium && products.length >= 5) {
  setMessage(
    "Достигнахте лимита от 5 продукта за Free плана. Преминете към Premium, за да добавяте неограничени продукти."
  );
  return;
}
    if (!name || !price || !description || !paymentLink) {
      setMessage("Моля, попълнете всички задължителни полета.");
      return;
    }

    if (Number(stock) < 0) {
      setMessage("Наличността не може да бъде отрицателна.");
      return;
    }

    if (hasVariants && (!variantName || !variantValues.trim())) {
      setMessage("Изберете тип вариант и въведете стойности.");
      return;
    }

    try {
      const normalizedPaymentLink = paymentLink.trim();

if (normalizedPaymentLink !== defaultPaymentLink) {
  const { error: linkError } = await supabase
    .from("profiles")
    .update({
      default_payment_link: normalizedPaymentLink,
    })
    .eq("id", userId);

  if (linkError) {
    console.error(
      "Грешка при запазване на постоянния линк:",
      linkError
    );

    setMessage(
      "Линкът не можа да бъде запазен в профила."
    );
    return;
  }

  setDefaultPaymentLink(normalizedPaymentLink);
}
      const imageUrl = await uploadImage();

      const productData = {
        name,
        price,
        stock: Number(stock),
        description,
        payment_link: paymentLink,
        product_type: productType,
        category,
        has_variants: hasVariants,
        variant_name: hasVariants ? variantName : null,
        variant_values: hasVariants
          ? variantValues
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
          : [],
      };

      if (editingId) {
        const updateData: Record<string, unknown> = {
          ...productData,
        };

        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        const { error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", editingId)
          .eq("owner_id", userId);

        if (error) {
          console.error(error);
          setMessage("Грешка при редактиране на продукта.");
          return;
        }

        setMessage("Продуктът е редактиран успешно.");
      } else {
       const { data: createdProducts, error } = await supabase
  .from("products")
  .insert([
    {
      ...productData,
      image_url: imageUrl,
      owner_id: userId,
      store_slug: storeSlug,
    },
  ])
  .select("id");

if (error) {
  console.error(error);
  setMessage("Грешка при записване на продукта.");
  return;
}

const createdProductId = createdProducts?.[0]?.id;

if (createdProductId !== undefined && createdProductId !== null) {
  await uploadGalleryImages(String(createdProductId));
}

        setMessage("Продуктът е записан успешно.");
      }

      resetForm();
      setCategory("Без категория");
      await loadProducts(userId);
    } catch (error) {
      console.error(error);
      setMessage("Грешка при качване на снимката.");
    }
  }

  function startEdit(product: Product) {
    setCategory(product.category || "Без категория");
    setEditingId(product.id);
    setProductType(product.product_type || "physical");
    setName(product.name);
    setPrice(product.price);
    setStock(String(product.stock ?? 1));
    setDescription(product.description);
    setPaymentLink(product.payment_link);
    setHasVariants(product.has_variants || false);
    setVariantName(product.variant_name || "");
    setVariantValues((product.variant_values || []).join(", "));
    setImageFile(null);
    setGalleryFiles([]);
    setMessage("Редактирате продукт.");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId);

    if (error) {
      console.error(error);
      alert("Грешка при изтриване.");
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="mb-8 text-4xl font-bold">Моите продукти</h1>
<div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <Card>
    <p className="text-sm text-gray-500">Общо продукти</p>
    <p className="mt-2 text-3xl font-bold">{products.length}</p>
  </Card>

  <Card>
    <p className="text-sm text-gray-500">Физически</p>
    <p className="mt-2 text-3xl font-bold">
      {products.filter((product) => product.product_type !== "digital").length}
    </p>
  </Card>

  <Card>
    <p className="text-sm text-gray-500">Дигитални</p>
    <p className="mt-2 text-3xl font-bold">
      {products.filter((product) => product.product_type === "digital").length}
    </p>
  </Card>

  <Card>
    <p className="text-sm text-gray-500">Изчерпани</p>
    <p className="mt-2 text-3xl font-bold">
      {products.filter((product) => (product.stock ?? 0) === 0).length}
    </p>
  </Card>
</div>
<div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
  <input
    type="text"
    placeholder="🔍 Търси продукт..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full rounded-xl border border-gray-300 px-4 py-3"
  />

  <select
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
    className="w-full rounded-xl border border-gray-300 px-4 py-3"
  >
    <option>Всички категории</option>
    <option>Без категория</option>
    <option>Дрехи</option>
    <option>Електроника</option>
    <option>Козметика</option>
  </select>

  <select
    value={typeFilter}
    onChange={(e) => setTypeFilter(e.target.value)}
    className="w-full rounded-xl border border-gray-300 px-4 py-3"
  >
    <option value="Всички">Всички</option>
    <option value="📦 Физически">📦 Физически</option>
    <option value="💻 Дигитални">💻 Дигитални</option>
  </select>

  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="w-full rounded-xl border border-gray-300 px-4 py-3"
  >
    <option>Най-нови</option>
    <option>Най-стари</option>
    <option>Цена ↑</option>
    <option>Цена ↓</option>
    <option>Азбучен ред</option>
  </select>
</div>

      <form
        onSubmit={addOrUpdateProduct}
        className="max-w-2xl rounded-xl bg-white p-6 shadow"
      >
        <label className="mb-2 block font-semibold">Тип продукт</label>
<label className="mb-2 block font-semibold">Категория</label>

<select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="mb-5 w-full rounded-lg border p-3"
>
  <option>Без категория</option>
  <option>Електроника</option>
  <option>Дрехи</option>
  <option>Козметика</option>
  <option>Дом и градина</option>
  <option>Играчки</option>
  <option>Книги</option>
  <option>Спорт</option>
  <option>Автомобили</option>
  <option>Дигитални продукти</option>
  <option>Други</option>
</select>
        <select
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          className="mb-5 w-full rounded-lg border p-3"
        >
          <option value="physical">📦 Физически продукт</option>
          <option value="digital">💻 Дигитален продукт</option>
        </select>

        <label className="mb-2 block font-semibold">
          Основна снимка на продукта
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="mb-5 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">
          Допълнителни снимки
        </label>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setGalleryFiles(Array.from(e.target.files || []))
          }
          className="mb-2 w-full rounded-lg border p-3"
        />

        <p className="mb-5 text-sm text-gray-500">
          Може да изберете няколко снимки наведнъж.
        </p>

        <label className="mb-2 block font-semibold">Име на продукта</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Телефон"
          className="mb-5 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">Цена</label>

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Например: 899"
          className="mb-5 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">Наличност</label>

        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          type="number"
          min="0"
          placeholder="Например: 25"
          className="mb-5 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">Описание</label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание на продукта..."
          className="mb-5 h-32 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">
          Линк за плащане
        </label>

        <input
          value={paymentLink}
          onChange={(e) => setPaymentLink(e.target.value)}
          placeholder="https://..."
          className="mb-5 w-full rounded-lg border p-3"
        />

        <div className="mb-5 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
            />

            <span>Този продукт има варианти</span>
          </label>
        </div>

        {hasVariants && (
          <div className="mb-6 rounded-xl bg-gray-50 p-4">
            <label className="mb-2 block font-semibold">Тип вариант</label>

            <select
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              className="mb-5 w-full rounded-lg border p-3"
            >
              <option value="">Изберете...</option>
              <option value="Размер">Размер</option>
              <option value="Цвят">Цвят</option>
              <option value="Номер">Номер</option>
              <option value="Памет">Памет</option>
              <option value="Обем">Обем</option>
              <option value="Материал">Материал</option>
              <option value="Собствен">Собствен вариант</option>
            </select>
<label className="mb-2 block font-semibold">
  Стойности на варианта
</label>

<input
  value={variantValues}
  onChange={(e) => setVariantValues(e.target.value)}
  placeholder="Например: S, M, L, XL или 128GB, 256GB"
  className="w-full rounded-lg border p-3"
/>
</div>
)}

{productType === "physical" && (
  <div className="mb-6">
    <label className="mb-2 block font-semibold">
      Начин на доставка
    </label>

    <select
      value={deliveryMethod}
      onChange={(e) => {
        const nextMethod = e.target.value;

        setDeliveryMethod(nextMethod);

        if (nextMethod !== "Econt") {
          setEcontSelection(null);
        }
      }}
      className="w-full rounded-lg border p-3"
    >
      <option>Наложен платеж</option>
      <option>Speedy</option>
      <option>Econt</option>
      <option>Лично предаване</option>
    </select>

{deliveryMethod === "Econt" && (
  <EcontDeliveryPicker
    onChange={setEcontSelection}
  />
)}
            {deliveryMethod === "Econt" && econtSelection && (
  <p className="mt-3 text-sm font-semibold text-green-700">
    ✅ Vendora получи избора: {econtSelection.cityName} →{" "}
    {econtSelection.officeName}
  </p>
)}
 <div className="mt-4 flex gap-3">
  <button
    type="button"
    onClick={() =>
      alert(
        "📦 Speedy интеграцията предстои.\n\nСкоро ще можете да свържете своя Speedy профил директно във Vendora."
      )
    }
    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
  >
    🚚 Speedy – скоро
  </button>

<button
  type="button"
  onClick={async () => {
    try {
      const response = await fetch("/api/econt/offices", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        alert(
          "❌ Неуспешна връзка с Econt.\n\nМоля, опитайте отново."
        );
        return;
      }

      alert(
        `✅ Връзката с Econt е активна.\n\nНамерени офиси: ${data.officeCount}`
      );
    } catch (error) {
      console.error("Econt connection test error:", error);

      alert(
        "❌ Неуспешна връзка с Econt.\n\nМоля, опитайте отново."
      );
    }
  }}
  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
>
  📦 Econt – провери връзката
</button>
</div>
          </div>
        )}
{storeSlug && (
  <div className="mb-6 rounded-xl border bg-gray-50 p-4">
    <p className="text-sm font-semibold text-gray-700">
      🔗 Линк към вашия магазин
    </p>

    <p className="mt-2 break-all text-blue-600">
      {`${window.location.origin}/store/${storeSlug}`}
    </p>

    <button
      type="button"
      onClick={copyStoreLink}
      className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
    >
      📋 Копирай линка
    </button>
  </div>
)}
        <Button type="submit">
  {editingId ? "Запази промените" : "Добави продукт"}
</Button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setMessage("");
            }}
            className="ml-4 rounded-xl bg-gray-300 px-8 py-3"
          >
            Откажи
          </button>
        )}

        {message && <p className="mt-4 font-semibold">{message}</p>}
      </form>

<section className="mt-10 grid max-w-2xl gap-6">
  {currentProducts.map((product) => (
 
         <Card key={product.id}>
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="mb-4 h-48 w-full rounded-lg object-cover"
              />
            )}

            <h2 className="text-2xl font-bold">{product.name}</h2>
<div className="mb-3 flex flex-wrap gap-2">
  <Badge variant="success">
    {product.product_type === "digital"
      ? "💻 Дигитален продукт"
      : "📦 Физически продукт"}
  </Badge>

  <Badge>
    {product.category || "Без категория"}
  </Badge>
</div>
            <p className="mt-2 font-semibold">{product.price} €</p>

           <div className="mt-3 flex items-center justify-between">
  <span className="font-medium">
    Наличност: {product.stock ?? 0} бр.
  </span>

  {product.stock === 0 ? (
    <Badge variant="danger">🔴 Изчерпан</Badge>
  ) : product.stock <= 5 ? (
    <Badge variant="warning">🟡 Малко останали</Badge>
  ) : (
    <Badge variant="success">🟢 В наличност</Badge>
  )}
</div>

            <p className="mt-2 text-gray-600">
              {product.description}
            </p>

            {product.has_variants && (
              <p className="mt-2 text-sm text-gray-600">
                {product.variant_name}:{" "}
                {(product.variant_values || []).join(", ")}
              </p>
            )}

           <Button
  type="button"
  onClick={() => startEdit(product)}
  className="mt-4 w-full"
>
  ✏️ Редактирай
</Button>

         <Button
  type="button"
  onClick={() => deleteProduct(product.id)}
  className="mt-4 w-full bg-red-600 hover:bg-red-700"
>
  🗑 Изтрий продукта
</Button>
          </Card>
        ))}
      </section>
      <div className="mt-8 flex items-center justify-center gap-4">
  <Button
    type="button"
    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
    disabled={currentPage === 1}
  >
    ← Предишна
  </Button>

  <span className="font-semibold">
    Страница {currentPage} от {totalPages}
  </span>

  <Button
    type="button"
    onClick={() =>
      setCurrentPage((page) => Math.min(page + 1, totalPages))
    }
    disabled={currentPage === totalPages}
  >
    Следваща →
  </Button>
</div>
    </main>
  );
}
