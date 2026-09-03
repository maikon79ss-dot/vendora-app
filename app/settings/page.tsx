"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import BannerEditor from "@/components/settings/BannerEditor";
import BannerGallery from "@/components/settings/BannerGallery";
import PaymentSettings from "@/components/settings/PaymentSettings";
import SocialSettings from "@/components/settings/SocialSettings";
import StoreSettings from "@/components/settings/StoreSettings";
import UploadSection from "@/components/settings/UploadSection";

import type {
  BannerTemplate,
  BannerTextColor,
  BannerTextPosition,
} from "@/components/settings/types";
type EcontSenderAddress = {
  id: number | null;
  fullAddress: string;
  city: {
    id: number | null;
    name: string;
    postCode: string;
  };
};
export default function SettingsPage() {
  const router = useRouter();

  const [bannerTemplates, setBannerTemplates] =
    useState<BannerTemplate[]>([]);

  const [userId, setUserId] = useState("");

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");
  const [defaultPaymentLink, setDefaultPaymentLink] =
    useState("");
const [stripeEnabled, setStripeEnabled] =
  useState(false);

const [paypalEnabled, setPaypalEnabled] =
  useState(false);

const [revolutEnabled, setRevolutEnabled] =
  useState(false);

const [bankTransferEnabled, setBankTransferEnabled] =
  useState(false);

const [codEnabled, setCodEnabled] =
  useState(true);
  const [econtEnabled, setEcontEnabled] =
  useState(false);
  const [econtUsername, setEcontUsername] =
  useState("");

const [econtPassword, setEcontPassword] =
  useState("");

const [econtConnecting, setEcontConnecting] =
  useState(false);

const [econtConnected, setEcontConnected] =
  useState(false);

const [econtClientName, setEcontClientName] =
  useState("");
const [econtAddresses, setEcontAddresses] =
  useState<EcontSenderAddress[]>([]);

const [
  econtSenderAddressId,
  setEcontSenderAddressId,
] = useState("");

const [
  econtAddressLoading,
  setEcontAddressLoading,
] = useState(false);

const [
  econtAddressSaving,
  setEcontAddressSaving,
] = useState(false);
const [econtClientNumber, setEcontClientNumber] =
  useState("");
  const [paypalPaymentLink, setPaypalPaymentLink] =
  useState("");

const [revolutPaymentLink, setRevolutPaymentLink] =
  useState("");

const [bankAccountHolder, setBankAccountHolder] =
  useState("");

const [bankIban, setBankIban] =
  useState("");

const [bankName, setBankName] =
  useState("");
  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [bannerFile, setBannerFile] =
    useState<File | null>(null);

  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [subscriptionPlan, setSubscriptionPlan] =
    useState("free");

  const [selectedBanner, setSelectedBanner] =
    useState("");

  const [bannerTitle, setBannerTitle] =
    useState("");

  const [bannerSubtitle, setBannerSubtitle] =
    useState("");

  const [bannerButton, setBannerButton] =
    useState("");

  const [bannerTextColor, setBannerTextColor] =
    useState<BannerTextColor>("white");

  const [bannerTextPosition, setBannerTextPosition] =
    useState<BannerTextPosition>("center");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isPremium =
    subscriptionPlan === "premium_monthly" ||
    subscriptionPlan === "premium_yearly";

  useEffect(() => {
  async function initializeSettings() {
    let stripeMessage = "";

    const searchParams = new URLSearchParams(
      window.location.search
    );

    const stripeResult = searchParams.get("stripe");

    if (stripeResult === "return") {
      const result = await syncStripeStatus();

      stripeMessage = result.success
        ? result.message
        : result.message;

      router.replace("/settings");
    }

    if (stripeResult === "refresh") {
      stripeMessage =
        "Stripe регистрацията не е завършена. Натиснете отново „Свържи Stripe“, за да продължите.";

      router.replace("/settings");
    }

    await loadSettings();
    await loadBannerTemplates();

    if (stripeMessage) {
      setMessage(stripeMessage);
    }
  }

  void initializeSettings();
}, []);
async function syncStripeStatus(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        message:
          "Неуспешна проверка на потребителската сесия.",
      };
    }

    const response = await fetch(
      "/api/stripe/connect/status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Stripe status synchronization error:",
        result
      );

     const requirements = result.requirements;

const missingFields = [
  ...(requirements?.currentlyDue || []),
  ...(requirements?.pastDue || []),
];

const pendingFields =
  requirements?.pendingVerification || [];

if (missingFields.length > 0) {
  return {
    success: false,
    message:
      `Stripe регистрацията не е завършена. ` +
      `Липсващи данни: ${missingFields.join(", ")}. ` +
      `Натиснете отново „Свържи Stripe“, за да продължите.`,
  };
}

if (pendingFields.length > 0) {
  return {
    success: false,
    message:
      "Stripe проверява подадените данни. Плащанията ще се активират след приключване на проверката.",
  };
}

return {
  success: false,
  message:
    `Stripe акаунтът още не е активен. ` +
    `Причина: ${requirements?.disabledReason || "неизвестна"}.`,
};
    }

    setStripeEnabled(
      result.stripeEnabled === true
    );

    if (result.stripeEnabled) {
      return {
        success: true,
        message:
          "✅ Stripe акаунтът е свързан и е готов да приема плащания.",
      };
    }

    return {
      success: false,
      message:
        "Stripe акаунтът е създаден, но регистрацията още не е напълно завършена.",
    };
  } catch (error) {
    console.error(
      "Stripe status synchronization error:",
      error
    );

    return {
      success: false,
      message:
        "Възникна грешка при проверката на Stripe акаунта.",
    };
  }
}

  async function loadSettings() {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(sessionError);

      setMessage(
        "Грешка при проверка на потребителската сесия."
      );

      setLoading(false);
      return;
    }

    if (!session) {
      router.push("/login");
      return;
    }

    setUserId(session.user.id);
    setEmail(session.user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error(error);

      setMessage(
        "Грешка при зареждане на настройките."
      );

      setLoading(false);
      return;
    }

    setStoreName(data?.store_name || "");
    setDescription(data?.description || "");
    setPhone(data?.phone || "");

    setFacebook(data?.facebook || "");
    setInstagram(data?.instagram || "");
    setTiktok(data?.tiktok || "");
    setYoutube(data?.youtube || "");
    setWebsite(data?.website || "");

    setDefaultPaymentLink(
      data?.default_payment_link || ""
    );
setStripeEnabled(data?.stripe_enabled ?? false);

setPaypalEnabled(data?.paypal_enabled ?? false);

setRevolutEnabled(data?.revolut_enabled ?? false);

setBankTransferEnabled(
  data?.bank_transfer_enabled ?? false
);

setCodEnabled(data?.cod_enabled ?? true);
    setEcontEnabled(data?.econt_enabled ?? false);
   const {
  data: econtConnection,
  error: econtConnectionError,
} = await supabase
  .from("econt_connections")
  .select(
    "is_connected, client_name, client_number"
  )
  .eq("user_id", session.user.id)
  .maybeSingle();

if (econtConnectionError) {
  console.error(
    "Econt connection load error:",
    econtConnectionError
  );
}

if (econtConnection) {
  setEcontConnected(
    econtConnection.is_connected === true
  );

  setEcontClientName(
    econtConnection.client_name || ""
  );

  setEcontClientNumber(
    econtConnection.client_number || ""
  );

  if (econtConnection.is_connected) {
    await loadEcontProfile(
      session.access_token
    );
  }
}
setPaypalPaymentLink(
  data?.paypal_payment_link || ""
);

setRevolutPaymentLink(
  data?.revolut_payment_link || ""
);

setBankAccountHolder(
  data?.bank_account_holder || ""
);

setBankIban(
  data?.bank_iban || ""
);

setBankName(
  data?.bank_name || ""
);
    setLogoUrl(data?.logo_url || "");
    setBannerUrl(data?.banner_url || "");

    setSubscriptionPlan(
      data?.subscription_plan || "free"
    );

    setSelectedBanner(
      data?.selected_banner || ""
    );

    setBannerTitle(
      data?.banner_title || ""
    );

    setBannerSubtitle(
      data?.banner_subtitle || ""
    );

    setBannerButton(
      data?.banner_button || ""
    );

    const loadedColor =
      data?.banner_text_color;

    setBannerTextColor(
      loadedColor === "black" ||
        loadedColor === "gold" ||
        loadedColor === "blue"
        ? loadedColor
        : "white"
    );

    const loadedPosition =
      data?.banner_text_position;

    setBannerTextPosition(
      loadedPosition === "left" ||
        loadedPosition === "right"
        ? loadedPosition
        : "center"
    );

    setLoading(false);
  }
    async function loadBannerTemplates() {
    async function collectFiles(
      folderPath: string
    ): Promise<string[]> {
      const { data, error } =
        await supabase.storage
          .from("banner-templates")
          .list(folderPath, {
            limit: 200,
            sortBy: {
              column: "name",
              order: "asc",
            },
          });

      if (error) {
        console.error(
          `Грешка при четене на папка "${folderPath}":`,
          error
        );

        return [];
      }

      const collectedFiles: string[] = [];

      for (const item of data || []) {
        const itemPath = folderPath
          ? `${folderPath}/${item.name}`
          : item.name;

        const lowerName =
          item.name.toLowerCase();

        const isImage =
          lowerName.endsWith(".png") ||
          lowerName.endsWith(".jpg") ||
          lowerName.endsWith(".jpeg") ||
          lowerName.endsWith(".webp");

        if (isImage) {
          collectedFiles.push(itemPath);
        } else {
          const filesInsideFolder =
            await collectFiles(itemPath);

          collectedFiles.push(
            ...filesInsideFolder
          );
        }
      }

      return collectedFiles;
    }

    const allFilePaths =
      await collectFiles("");

    const templates: BannerTemplate[] =
      allFilePaths.map((filePath) => {
        const lowerPath =
          filePath.toLowerCase();

        const fileName =
          filePath.split("/").pop() ||
          filePath;

        const lowerFileName =
          fileName.toLowerCase();

        const isPremiumBanner =
          lowerPath.includes("/premium/") ||
          lowerPath.startsWith("premium/") ||
          lowerFileName.startsWith(
            "premium"
          ) ||
          lowerFileName.startsWith(
            "free premium"
          );

        const { data } =
          supabase.storage
            .from("banner-templates")
            .getPublicUrl(filePath);

        return {
          id: filePath,
          name: fileName
            .replace(
              /\.(png|jpg|jpeg|webp)$/i,
              ""
            )
            .replace(/[-_]/g, " "),
          premium: isPremiumBanner,
          imageUrl: data.publicUrl,
        };
      });

    setBannerTemplates(templates);

    if (templates.length === 0) {
      setMessage(
        "Не са намерени изображения в banner-templates."
      );
    }
  }

  function selectBannerTemplate(
    template: BannerTemplate
  ) {
    if (
      template.premium &&
      !isPremium
    ) {
      setMessage(
        "Този банер е достъпен само с Premium план."
      );

      return;
    }

    setSelectedBanner(template.id);
    setBannerUrl(template.imageUrl);
    setBannerFile(null);

    setMessage(
      `Избран е шаблонът „${template.name}“. Натиснете „Запази настройките“.`
    );
  }

  async function uploadImage(
    file: File,
    folder: string
  ) {
    const fileExtension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "png";

    const fileName =
      `${folder}-${userId}-${Date.now()}.${fileExtension}`;

    const { error } =
      await supabase.storage
        .from("store-assets")
        .upload(fileName, file);

    if (error) {
      console.error(error);

      setMessage(
        "Грешка при качване на изображението."
      );

      return "";
    }

    const { data } =
      supabase.storage
        .from("store-assets")
        .getPublicUrl(fileName);

    return data.publicUrl;
  }
  async function loadEcontProfile(
  accessToken?: string
) {
  setEcontAddressLoading(true);

  try {
    let token = accessToken;

    if (!token) {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setMessage(
          "Неуспешна проверка на потребителската сесия."
        );
        return;
      }

      token = session.access_token;
    }

    const response = await fetch(
      "/api/econt/profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      setMessage(
        result.error ||
          "Econt профилът не можа да бъде зареден."
      );
      return;
    }

    const addresses = Array.isArray(
      result.profile?.addresses
    )
      ? result.profile.addresses
      : [];

    setEcontAddresses(addresses);

    setEcontSenderAddressId(
      result.profile?.senderAddressId
        ? String(result.profile.senderAddressId)
        : ""
    );

    setEcontClientName(
      result.profile?.clientName || ""
    );

    setEcontClientNumber(
      result.profile?.clientNumber || ""
    );

    setEcontConnected(true);
  } catch (error) {
    console.error(
      "Econt profile load error:",
      error
    );

    setMessage(
      "Възникна грешка при зареждането на Econt адресите."
    );
  } finally {
    setEcontAddressLoading(false);
  }
}

async function saveEcontSenderAddress() {
  if (!econtSenderAddressId) {
    setMessage(
      "Изберете адрес на подателя."
    );
    return;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    setMessage(
      "Неуспешна проверка на потребителската сесия."
    );
    return;
  }

  setEcontAddressSaving(true);
  setMessage("");

  try {
    const response = await fetch(
      "/api/econt/sender-address",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          senderAddressId:
            Number(econtSenderAddressId),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      setMessage(
        result.error ||
          "Адресът на подателя не можа да бъде запазен."
      );
      return;
    }

    setMessage(
      "✅ Econt адресът на подателя е запазен."
    );
  } catch (error) {
    console.error(
      "Econt sender address save error:",
      error
    );

    setMessage(
      "Възникна грешка при записването на Econt адреса."
    );
  } finally {
    setEcontAddressSaving(false);
  }
}
async function connectEcont() {
  if (
    !econtUsername.trim() ||
    !econtPassword
  ) {
    setMessage(
      "Въведете Econt потребителско име и парола."
    );
    return;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    setMessage(
      "Неуспешна проверка на потребителската сесия."
    );
    return;
  }

  setEcontConnecting(true);
  setMessage("");

  try {
    const response = await fetch(
      "/api/econt/connect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username: econtUsername.trim(),
          password: econtPassword,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      setMessage(
        result.error ||
          "Econt акаунтът не можа да бъде свързан."
      );
      return;
    }

    setEcontConnected(true);

    setEcontClientName(
      result.connection?.clientName || ""
    );

    setEcontClientNumber(
      result.connection?.clientNumber || ""
    );
await loadEcontProfile(
  session.access_token
);
    setEcontPassword("");

    setMessage(
      "✅ Econt акаунтът е свързан успешно."
    );
  } catch (error) {
    console.error(
      "Econt connect error:",
      error
    );

    setMessage(
      "Възникна грешка при свързването с Econt."
    );
  } finally {
    setEcontConnecting(false);
  }
}
  async function saveSettings() {
    if (!userId) {
      setMessage(
        "Липсва потребителски профил."
      );

      return;
    }

    setSaving(true);
    setMessage("");
if (
  paypalEnabled &&
  !paypalPaymentLink.trim()
) {
  setMessage(
    "Въведете PayPal платежен линк."
  );
  setSaving(false);
  return;
}

if (
  revolutEnabled &&
  !revolutPaymentLink.trim()
) {
  setMessage(
    "Въведете Revolut платежен линк."
  );
  setSaving(false);
  return;
}

if (
  bankTransferEnabled &&
  (
    !bankAccountHolder.trim() ||
    !bankIban.trim() ||
    !bankName.trim()
  )
) {
  setMessage(
    "Попълнете титуляр, IBAN и име на банката."
  );
  setSaving(false);
  return;
}
    let newLogoUrl = logoUrl;
    let newBannerUrl = bannerUrl;

    if (logoFile) {
      const uploadedLogo =
        await uploadImage(
          logoFile,
          "logo"
        );

      if (!uploadedLogo) {
        setSaving(false);
        return;
      }

      newLogoUrl = uploadedLogo;
    }

    if (bannerFile) {
      const uploadedBanner =
        await uploadImage(
          bannerFile,
          "banner"
        );

      if (!uploadedBanner) {
        setSaving(false);
        return;
      }

      newBannerUrl = uploadedBanner;
    }
console.log("PAYMENT SETTINGS BEFORE SAVE:", {
  stripeEnabled,
  paypalEnabled,
  revolutEnabled,
  bankTransferEnabled,
  codEnabled,
});
    const { error } = await supabase
      .from("profiles")
      .update({
        store_name: storeName,
        description,
        phone,

        facebook,
        instagram,
        tiktok,
        youtube,
        website,

        default_payment_link:
          defaultPaymentLink,
stripe_enabled: stripeEnabled,

paypal_enabled: paypalEnabled,
paypal_payment_link:
  paypalPaymentLink.trim(),

revolut_enabled: revolutEnabled,
revolut_payment_link:
  revolutPaymentLink.trim(),

bank_transfer_enabled:
  bankTransferEnabled,

bank_account_holder:
  bankAccountHolder.trim(),

bank_iban:
  bankIban.trim(),

bank_name:
  bankName.trim(),

cod_enabled: codEnabled,
        econt_enabled: econtEnabled,
        logo_url: newLogoUrl,
        banner_url: newBannerUrl,

        selected_banner:
          selectedBanner,

        banner_title:
          bannerTitle,

        banner_subtitle:
          bannerSubtitle,

        banner_button:
          bannerButton,

        banner_text_color:
          bannerTextColor,

        banner_text_position:
          bannerTextPosition,
      })
      .eq("id", userId);

    if (error) {
      console.error(error);

      setMessage(
        "Грешка при запазване."
      );

      setSaving(false);
      return;
    }

    setLogoUrl(newLogoUrl);
    setBannerUrl(newBannerUrl);

    setLogoFile(null);
    setBannerFile(null);

    setMessage(
      "Настройките са запазени успешно."
    );

    setSaving(false);
  }
if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        Зареждане...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">
          ⚙ Настройки на магазина
        </h1>

        <p className="mt-3 text-gray-600">
          Управлявайте информацията и дизайна на магазина.
        </p>

        {message && (
          <p className="mt-5 rounded-xl bg-blue-50 p-4 font-semibold text-blue-700">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-8">
          <StoreSettings
            storeName={storeName}
            description={description}
            phone={phone}
            email={email}
            onStoreNameChange={setStoreName}
            onDescriptionChange={setDescription}
            onPhoneChange={setPhone}
          />

          <PaymentSettings
  defaultPaymentLink={defaultPaymentLink}
  onDefaultPaymentLinkChange={setDefaultPaymentLink}

  stripeEnabled={stripeEnabled}
  onStripeEnabledChange={setStripeEnabled}

  paypalEnabled={paypalEnabled}
  onPaypalEnabledChange={setPaypalEnabled}
  paypalPaymentLink={paypalPaymentLink}
  onPaypalPaymentLinkChange={setPaypalPaymentLink}

  revolutEnabled={revolutEnabled}
  onRevolutEnabledChange={setRevolutEnabled}
  revolutPaymentLink={revolutPaymentLink}
  onRevolutPaymentLinkChange={setRevolutPaymentLink}

  bankTransferEnabled={bankTransferEnabled}
  onBankTransferEnabledChange={setBankTransferEnabled}
  bankAccountHolder={bankAccountHolder}
  onBankAccountHolderChange={setBankAccountHolder}
  bankIban={bankIban}
  onBankIbanChange={setBankIban}
  bankName={bankName}
  onBankNameChange={setBankName}

  codEnabled={codEnabled}
  onCodEnabledChange={setCodEnabled}
/>
<div className="rounded-2xl bg-white p-6 shadow">
  <h2 className="text-2xl font-bold">
    📦 Доставка с Econt
  </h2>

  <p className="mt-2 text-gray-600">
    Свържете своя Econt акаунт и разрешете на клиентите
    да избират офис на Econt при поръчка.
  </p>

  <div
    className={`mt-5 rounded-xl p-4 ${
      econtConnected
        ? "bg-green-50 text-green-800"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {econtConnected ? (
      <>
        <p className="font-bold">
          ✅ Econt акаунтът е свързан
        </p>

        {econtClientName && (
          <p className="mt-2 text-sm">
            Клиент: {econtClientName}
          </p>
        )}

        {econtClientNumber && (
          <p className="mt-1 text-sm">
            Клиентски номер: {econtClientNumber}
          </p>
        )}
      </>
    ) : (
      <p className="font-semibold">
        Econt акаунтът все още не е свързан.
      </p>
    )}
  </div>

  <div className="mt-5 space-y-3">
    <input
      type="text"
      value={econtUsername}
      onChange={(e) =>
        setEcontUsername(e.target.value)
      }
      placeholder="Econt потребителско име"
      autoComplete="username"
      className="w-full rounded-lg border p-3"
    />

    <input
      type="password"
      value={econtPassword}
      onChange={(e) =>
        setEcontPassword(e.target.value)
      }
      placeholder="Econt парола"
      autoComplete="current-password"
      className="w-full rounded-lg border p-3"
    />

    <button
      type="button"
      onClick={connectEcont}
      disabled={econtConnecting}
      className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
    >
      {econtConnecting
        ? "Свързване..."
        : econtConnected
          ? "Обнови Econt връзката"
          : "Свържи Econt"}
    </button>
  </div>
{econtConnected && (
  <div className="mt-6 rounded-xl border p-4">
    <label className="block font-semibold">
      Адрес на подателя
    </label>

    <p className="mt-1 text-sm text-gray-600">
      Изберете адреса, от който ще изпращате
      пратките с Econt.
    </p>

    {econtAddressLoading ? (
      <p className="mt-4 text-sm text-gray-600">
        Зареждане на Econt адресите...
      </p>
    ) : econtAddresses.length > 0 ? (
      <>
        <select
          value={econtSenderAddressId}
          onChange={(e) =>
            setEcontSenderAddressId(
              e.target.value
            )
          }
          className="mt-4 w-full rounded-lg border p-3"
        >
          <option value="">
            Изберете адрес
          </option>

          {econtAddresses.map((address) =>
            address.id !== null ? (
              <option
                key={address.id}
                value={String(address.id)}
              >
                {address.fullAddress ||
                  `${address.city.name} ${
                    address.city.postCode || ""
                  }`}
              </option>
            ) : null
          )}
        </select>

        <button
          type="button"
          onClick={saveEcontSenderAddress}
          disabled={
            econtAddressSaving ||
            !econtSenderAddressId
          }
          className="mt-3 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {econtAddressSaving
            ? "Запазване..."
            : "Запази адреса"}
        </button>
      </>
    ) : (
      <p className="mt-4 text-sm font-semibold text-gray-600">
        Няма намерени адреси в Econt профила.
      </p>
    )}
  </div>
)}
  <label className="mt-6 flex items-center gap-3">
    <input
      type="checkbox"
      checked={econtEnabled}
      onChange={(e) =>
        setEcontEnabled(e.target.checked)
      }
      className="h-5 w-5"
    />

    <span className="font-semibold">
      Разреши Econt за моя магазин
    </span>
  </label>
</div>
          <SocialSettings
            facebook={facebook}
            instagram={instagram}
            tiktok={tiktok}
            youtube={youtube}
            website={website}
            onFacebookChange={setFacebook}
            onInstagramChange={setInstagram}
            onTiktokChange={setTiktok}
            onYoutubeChange={setYoutube}
            onWebsiteChange={setWebsite}
          />

          <BannerEditor
            bannerUrl={bannerUrl}
            title={bannerTitle}
            subtitle={bannerSubtitle}
            buttonText={bannerButton}
            textColor={bannerTextColor}
            textPosition={bannerTextPosition}
            onTitleChange={setBannerTitle}
            onSubtitleChange={setBannerSubtitle}
            onButtonTextChange={setBannerButton}
            onTextColorChange={setBannerTextColor}
            onTextPositionChange={setBannerTextPosition}
          />
<div className="mt-6 flex justify-end">
  <button
    type="button"
    onClick={saveSettings}
    disabled={saving}
    className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
  >
    {saving
      ? "Запазване..."
      : "💾 Запази настройките"}
  </button>
</div>
          <UploadSection
            logoUrl={logoUrl}
            bannerUrl={bannerUrl}
            onLogoFileChange={setLogoFile}
            onBannerFileChange={setBannerFile}
          />

          <BannerGallery
            templates={bannerTemplates}
            selectedBanner={selectedBanner}
            isPremium={isPremium}
            subscriptionPlan={subscriptionPlan}
            onSelect={selectBannerTemplate}
          />

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving
              ? "Запазване..."
              : "💾 Запази настройките"}
          </button>
        </div>
      </div>
    </main>
  );
}
