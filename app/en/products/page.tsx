"use client";

import EcontDeliveryPicker, {
  type EcontSelection,
} from "@/app/products/components/EcontDeliveryPicker";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/app/products/components/ui/Card";
import Button from "@/app/products/components/ui/Button";
import Badge from "@/app/products/components/ui/Badge";

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

function getCategoryLabel(value?: string) {
  switch (value) {
    case "Без категория":
      return "Uncategorized";
    case "Електроника":
      return "Electronics";
    case "Дрехи":
      return "Clothing";
    case "Козметика":
      return "Cosmetics";
    case "Дом и градина":
      return "Home & Garden";
    case "Играчки":
      return "Toys";
    case "Книги":
      return "Books";
    case "Спорт":
      return "Sports";
    case "Автомобили":
      return "Automotive";
    case "Дигитални продукти":
      return "Digital Products";
    case "Други":
      return "Other";
    default:
      return value || "Uncategorized";
  }
}

function getVariantLabel(value?: string) {
  switch (value) {
    case "Размер":
      return "Size";
    case "Цвят":
      return "Color";
    case "Номер":
      return "Number";
    case "Памет":
      return "Memory";
    case "Обем":
      return "Volume";
    case "Материал":
      return "Material";
    case "Собствен":
      return "Custom";
    default:
      return value || "";
  }
}

export default function ProductsPageEn() {
  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] =
    useState("Наложен платеж");

  const [econtSelection, setEcontSelection] =
    useState<EcontSelection | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [productType, setProductType] =
    useState("physical");

  const [category, setCategory] =
    useState("Без категория");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] =
    useState("");
  const [paymentLink, setPaymentLink] =
    useState("");

  const [
    defaultPaymentLink,
    setDefaultPaymentLink,
  ] = useState("");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [galleryFiles, setGalleryFiles] =
    useState<File[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("Всички категории");

  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [storeSlug, setStoreSlug] =
    useState("");

  const [subscriptionPlan, setSubscriptionPlan] =
    useState("free");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [typeFilter, setTypeFilter] =
    useState("Всички");

  const [hasVariants, setHasVariants] =
    useState(false);

  const [variantName, setVariantName] =
    useState("");

  const [variantValues, setVariantValues] =
    useState("");

  const [sortBy, setSortBy] =
    useState("Най-нови");

  const [currentPage, setCurrentPage] =
    useState(1);

  const productsPerPage = 10;

  const indexOfLastProduct =
    currentPage * productsPerPage;

  const indexOfFirstProduct =
    indexOfLastProduct - productsPerPage;

  const filteredProducts = products
    .filter((product) =>
      product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((product) =>
      categoryFilter === "Всички категории"
        ? true
        : (product.category || "Без категория") ===
          categoryFilter
    )
    .filter((product) =>
      typeFilter === "Всички"
        ? true
        : typeFilter === "📦 Физически"
        ? product.product_type !== "digital"
        : product.product_type === "digital"
    )
    .sort((a, b) => {
      if (sortBy === "Цена ↑") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "Цена ↓") {
        return Number(b.price) - Number(a.price);
      }

      if (sortBy === "Азбучен ред") {
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

  const currentProducts =
    filteredProducts.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  useEffect(() => {
    checkUser();
  }, []);

  async function copyStoreLink() {
    if (!storeSlug) return;

    const storeUrl =
      `${window.location.origin}/en/store/${storeSlug}`;

    await navigator.clipboard.writeText(
      storeUrl
    );

    alert("✅ Store link copied.");
  }

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/en/login");
      return;
    }

    const currentUserId =
      session.user.id;

    const currentStoreSlug =
      session.user.user_metadata.store_slug ||
      "my-store";

    setUserId(currentUserId);
    setStoreSlug(currentStoreSlug);

    const { data: profile } =
      await supabase
        .from("profiles")
        .select(
          "default_payment_link, subscription_plan"
        )
        .eq("id", currentUserId)
        .single();

    if (profile?.default_payment_link) {
      setDefaultPaymentLink(
        profile.default_payment_link
      );

      setPaymentLink(
        profile.default_payment_link
      );
    }

    setSubscriptionPlan(
      profile?.subscription_plan || "free"
    );

    await loadProducts(currentUserId);
  }

  async function loadProducts(
    currentUserId: string
  ) {
    const { data, error } =
      await supabase
        .from("products")
        .select("*")
        .eq("owner_id", currentUserId)
        .order("id", {
          ascending: false,
        });

    if (error) {
      console.error(error);

      setMessage(
        "Error while loading your products."
      );

      return;
    }

    setProducts(data || []);
  }

  async function uploadImage() {
    if (!imageFile) return "";

    const fileExt =
      imageFile.name.split(".").pop();

    const fileName =
      `${Date.now()}.${fileExt}`;

    const { error } =
      await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

    if (error) throw error;

    const { data } =
      supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function uploadGalleryImages(
    productId: string
  ) {
    if (galleryFiles.length === 0) {
      return;
    }

    for (
      let index = 0;
      index < galleryFiles.length;
      index++
    ) {
      const file = galleryFiles[index];

      const fileExt =
        file.name.split(".").pop();

      const fileName =
        `${productId}-${Date.now()}-${index}.${fileExt}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

      const { error: imageRowError } =
        await supabase
          .from("product_images")
          .insert([
            {
              product_id: productId,
              image_url:
                publicUrlData.publicUrl,
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

  async function addOrUpdateProduct(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const isPremium =
      subscriptionPlan ===
        "premium_monthly" ||
      subscriptionPlan ===
        "premium_yearly";

    if (
      !editingId &&
      !isPremium &&
      products.length >= 5
    ) {
      setMessage(
        "You have reached the 5-product limit on the Free plan. Upgrade to Premium to add unlimited products."
      );

      return;
    }

    if (
      !name ||
      !price ||
      !description ||
      !paymentLink
    ) {
      setMessage(
        "Please fill in all required fields."
      );

      return;
    }

    if (Number(stock) < 0) {
      setMessage(
        "Stock cannot be negative."
      );

      return;
    }

    if (
      hasVariants &&
      (!variantName ||
        !variantValues.trim())
    ) {
      setMessage(
        "Choose a variant type and enter its values."
      );

      return;
    }

    try {
      const normalizedPaymentLink =
        paymentLink.trim();

      if (
        normalizedPaymentLink !==
        defaultPaymentLink
      ) {
        const { error: linkError } =
          await supabase
            .from("profiles")
            .update({
              default_payment_link:
                normalizedPaymentLink,
            })
            .eq("id", userId);

        if (linkError) {
          console.error(
            "Default payment link save error:",
            linkError
          );

          setMessage(
            "The payment link could not be saved to your profile."
          );

          return;
        }

        setDefaultPaymentLink(
          normalizedPaymentLink
        );
      }

      const imageUrl =
        await uploadImage();

      const productData = {
        name,
        price,
        stock: Number(stock),
        description,
        payment_link: paymentLink,
        product_type: productType,
        category,
        has_variants: hasVariants,
        variant_name: hasVariants
          ? variantName
          : null,
        variant_values: hasVariants
          ? variantValues
              .split(",")
              .map((value) =>
                value.trim()
              )
              .filter(Boolean)
          : [],
      };

      if (editingId) {
        const updateData: Record<
          string,
          unknown
        > = {
          ...productData,
        };

        if (imageUrl) {
          updateData.image_url =
            imageUrl;
        }

        const { error } =
          await supabase
            .from("products")
            .update(updateData)
            .eq("id", editingId)
            .eq("owner_id", userId);

        if (error) {
          console.error(error);

          setMessage(
            "Error while updating the product."
          );

          return;
        }

        setMessage(
          "Product updated successfully."
        );
      } else {
        const {
          data: createdProducts,
          error,
        } = await supabase
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

          setMessage(
            "Error while saving the product."
          );

          return;
        }

        const createdProductId =
          createdProducts?.[0]?.id;

        if (
          createdProductId !==
            undefined &&
          createdProductId !== null
        ) {
          await uploadGalleryImages(
            String(createdProductId)
          );
        }

        setMessage(
          "Product saved successfully."
        );
      }

      resetForm();
      setCategory("Без категория");
      await loadProducts(userId);
    } catch (error) {
      console.error(error);

      setMessage(
        "Error while uploading the image."
      );
    }
  }

  function startEdit(
    product: Product
  ) {
    setCategory(
      product.category ||
        "Без категория"
    );

    setEditingId(product.id);

    setProductType(
      product.product_type ||
        "physical"
    );

    setName(product.name);
    setPrice(product.price);
    setStock(
      String(product.stock ?? 1)
    );

    setDescription(
      product.description
    );

    setPaymentLink(
      product.payment_link
    );

    setHasVariants(
      product.has_variants || false
    );

    setVariantName(
      product.variant_name || ""
    );

    setVariantValues(
      (
        product.variant_values || []
      ).join(", ")
    );

    setImageFile(null);
    setGalleryFiles([]);

    setMessage(
      "You are editing this product."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteProduct(
    id: string
  ) {
    const { error } =
      await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("owner_id", userId);

    if (error) {
      console.error(error);

      alert(
        "Error while deleting the product."
      );

      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) =>
          product.id !== id
      )
    );
  }

  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-50 p-10"
    >
      <h1 className="mb-8 text-4xl font-bold">
        My Products
      </h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-gray-500">
            Total products
          </p>

          <p className="mt-2 text-3xl font-bold">
            {products.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Physical
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              products.filter(
                (product) =>
                  product.product_type !==
                  "digital"
              ).length
            }
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Digital
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              products.filter(
                (product) =>
                  product.product_type ===
                  "digital"
              ).length
            }
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Out of stock
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              products.filter(
                (product) =>
                  (product.stock ?? 0) ===
                  0
              ).length
            }
          </p>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        >
          <option value="Всички категории">
            All categories
          </option>

          <option value="Без категория">
            Uncategorized
          </option>

          <option value="Дрехи">
            Clothing
          </option>

          <option value="Електроника">
            Electronics
          </option>

          <option value="Козметика">
            Cosmetics
          </option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        >
          <option value="Всички">
            All
          </option>

          <option value="📦 Физически">
            📦 Physical
          </option>

          <option value="💻 Дигитални">
            💻 Digital
          </option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        >
          <option value="Най-нови">
            Newest
          </option>

          <option value="Най-стари">
            Oldest
          </option>

          <option value="Цена ↑">
            Price ↑
          </option>

          <option value="Цена ↓">
            Price ↓
          </option>

          <option value="Азбучен ред">
            Alphabetical
          </option>
        </select>
      </div>

      <form
        onSubmit={
          addOrUpdateProduct
        }
        className="max-w-2xl rounded-xl bg-white p-6 shadow"
      >
        <label className="mb-2 block font-semibold">
          Product type
        </label>

        <label className="mb-2 block font-semibold">
          Category
        </label>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="mb-5 w-full rounded-lg border p-3"
        >
          <option value="Без категория">
            Uncategorized
          </option>

          <option value="Електроника">
            Electronics
          </option>

          <option value="Дрехи">
            Clothing
          </option>

          <option value="Козметика">
            Cosmetics
          </option>

          <option value="Дом и градина">
            Home & Garden
          </option>

          <option value="Играчки">
            Toys
          </option>

          <option value="Книги">
            Books
          </option>

          <option value="Спорт">
            Sports
          </option>

          <option value="Автомобили">
            Automotive
          </option>

          <option value="Дигитални продукти">
            Digital Products
          </option>

          <option value="Други">
            Other
          </option>
        </select>

        <select
          value={productType}
          onChange={(e) =>
            setProductType(
              e.target.value
            )
          }
          className="mb-5 w-full rounded-lg border p-3"
        >
          <option value="physical">
            📦 Physical product
          </option>

          <option value="digital">
            💻 Digital product
          </option>
        </select>

        <label className="mb-2 block font-semibold">
          Main product image
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImageFile(
              e.target.files?.[0] ||
                null
            )
          }
          className="mb-5 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">
          Additional images
        </label>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setGalleryFiles(
              Array.from(
                e.target.files || []
              )
            )
          }
          className="mb-2 w-full rounded-lg border p-3"
        />

        <p className="mb-5 text-sm text-gray-500">
          You can select several images
          at once.
        </p>

        <label className="mb-2 block font-semibold">
          Product name
        </label>

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Example: Smartphone"
          className="mb-5 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">
          Price
        </label>

        <input
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          placeholder="Example: 899"
          className="mb-5 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">
          Stock
        </label>

        <input
          value={stock}
          onChange={(e) =>
            setStock(e.target.value)
          }
          type="number"
          min="0"
          placeholder="Example: 25"
          className="mb-5 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          placeholder="Product description..."
          className="mb-5 h-32 w-full rounded-lg border p-3"
        />

        <label className="mb-2 block font-semibold">
          Payment link
        </label>

        <input
          value={paymentLink}
          onChange={(e) =>
            setPaymentLink(
              e.target.value
            )
          }
          placeholder="https://..."
          className="mb-5 w-full rounded-lg border p-3"
        />

        <div className="mb-5 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) =>
                setHasVariants(
                  e.target.checked
                )
              }
            />

            <span>
              This product has variants
            </span>
          </label>
        </div>

        {hasVariants && (
          <div className="mb-6 rounded-xl bg-gray-50 p-4">
            <label className="mb-2 block font-semibold">
              Variant type
            </label>

            <select
              value={variantName}
              onChange={(e) =>
                setVariantName(
                  e.target.value
                )
              }
              className="mb-5 w-full rounded-lg border p-3"
            >
              <option value="">
                Select...
              </option>

              <option value="Размер">
                Size
              </option>

              <option value="Цвят">
                Color
              </option>

              <option value="Номер">
                Number
              </option>

              <option value="Памет">
                Memory
              </option>

              <option value="Обем">
                Volume
              </option>

              <option value="Материал">
                Material
              </option>

              <option value="Собствен">
                Custom variant
              </option>
            </select>

            <label className="mb-2 block font-semibold">
              Variant values
            </label>

            <input
              value={variantValues}
              onChange={(e) =>
                setVariantValues(
                  e.target.value
                )
              }
              placeholder="Example: S, M, L, XL or 128GB, 256GB"
              className="w-full rounded-lg border p-3"
            />
          </div>
        )}

        {productType ===
          "physical" && (
          <div className="mb-6">
            <label className="mb-2 block font-semibold">
              Delivery method
            </label>

            <select
              value={deliveryMethod}
              onChange={(e) => {
                const nextMethod =
                  e.target.value;

                setDeliveryMethod(
                  nextMethod
                );

                if (
                  nextMethod !==
                  "Econt"
                ) {
                  setEcontSelection(
                    null
                  );
                }
              }}
              className="w-full rounded-lg border p-3"
            >
              <option value="Наложен платеж">
                Cash on delivery
              </option>

              <option value="Speedy">
                Speedy
              </option>

              <option value="Econt">
                Econt
              </option>

              <option value="Лично предаване">
                Personal delivery
              </option>
            </select>

            {deliveryMethod ===
              "Econt" && (
              <EcontDeliveryPicker
                language="en"
                onChange={
                  setEcontSelection
                }
              />
            )}

            {deliveryMethod ===
              "Econt" &&
              econtSelection && (
                <p className="mt-3 text-sm font-semibold text-green-700">
                  ✅ Vendora received
                  your selection:{" "}
                  {
                    econtSelection.cityName
                  }{" "}
                  →{" "}
                  {
                    econtSelection.officeName
                  }
                </p>
              )}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  alert(
                    "📦 Speedy integration is coming soon.\n\nSoon you will be able to connect your Speedy account directly to Vendora."
                  )
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                🚚 Speedy – coming soon
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const response =
                      await fetch(
                        "/api/econt/offices",
                        {
                          cache:
                            "no-store",
                        }
                      );

                    const data =
                      await response.json();

                    if (
                      !response.ok ||
                      !data.ok
                    ) {
                      alert(
                        "❌ Unable to connect to Econt.\n\nPlease try again."
                      );

                      return;
                    }

                    alert(
                      `✅ The Econt connection is active.\n\nOffices found: ${data.officeCount}`
                    );
                  } catch (error) {
                    console.error(
                      "Econt connection test error:",
                      error
                    );

                    alert(
                      "❌ Unable to connect to Econt.\n\nPlease try again."
                    );
                  }
                }}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                📦 Econt – check connection
              </button>
            </div>
          </div>
        )}

        {storeSlug && (
          <div className="mb-6 rounded-xl border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-700">
              🔗 Your store link
            </p>

            <p className="mt-2 break-all text-blue-600">
              {`${window.location.origin}/en/store/${storeSlug}`}
            </p>

            <button
              type="button"
              onClick={copyStoreLink}
              className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              📋 Copy link
            </button>
          </div>
        )}

        <Button type="submit">
          {editingId
            ? "Save changes"
            : "Add product"}
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
            Cancel
          </button>
        )}

        {message && (
          <p className="mt-4 font-semibold">
            {message}
          </p>
        )}
      </form>

      <section className="mt-10 grid max-w-2xl gap-6">
        {currentProducts.map(
          (product) => (
            <Card key={product.id}>
              {product.image_url && (
                <img
                  src={
                    product.image_url
                  }
                  alt={product.name}
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                />
              )}

              <h2 className="text-2xl font-bold">
                {product.name}
              </h2>

              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="success">
                  {product.product_type ===
                  "digital"
                    ? "💻 Digital product"
                    : "📦 Physical product"}
                </Badge>

                <Badge>
                  {getCategoryLabel(
                    product.category
                  )}
                </Badge>
              </div>

              <p className="mt-2 font-semibold">
                {product.price} €
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="font-medium">
                  Stock:{" "}
                  {product.stock ?? 0}
                </span>

                {product.stock === 0 ? (
                  <Badge variant="danger">
                    🔴 Out of stock
                  </Badge>
                ) : product.stock <= 5 ? (
                  <Badge variant="warning">
                    🟡 Low stock
                  </Badge>
                ) : (
                  <Badge variant="success">
                    🟢 In stock
                  </Badge>
                )}
              </div>

              <p className="mt-2 text-gray-600">
                {product.description}
              </p>

              {product.has_variants && (
                <p className="mt-2 text-sm text-gray-600">
                  {getVariantLabel(
                    product.variant_name
                  )}
                  :{" "}
                  {(
                    product.variant_values ||
                    []
                  ).join(", ")}
                </p>
              )}

              <Button
                type="button"
                onClick={() =>
                  startEdit(product)
                }
                className="mt-4 w-full"
              >
                ✏️ Edit
              </Button>

              <Button
                type="button"
                onClick={() =>
                  deleteProduct(
                    product.id
                  )
                }
                className="mt-4 w-full bg-red-600 hover:bg-red-700"
              >
                🗑 Delete product
              </Button>
            </Card>
          )
        )}
      </section>

      <div className="mt-8 flex items-center justify-center gap-4">
        <Button
          type="button"
          onClick={() =>
            setCurrentPage((page) =>
              Math.max(page - 1, 1)
            )
          }
          disabled={currentPage === 1}
        >
          ← Previous
        </Button>

        <span className="font-semibold">
          Page {currentPage} of{" "}
          {totalPages}
        </span>

        <Button
          type="button"
          onClick={() =>
            setCurrentPage((page) =>
              Math.min(
                page + 1,
                totalPages
              )
            )
          }
          disabled={
            currentPage === totalPages
          }
        >
          Next →
        </Button>
      </div>
    </main>
  );
}
