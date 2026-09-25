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
  quarter?: string;
  street?: string;
  num?: string;
  other?: string;
  city: {
    id: number | null;
    name: string;
    postCode: string;
  };
};
type EcontCodPayOption = {
  key: string;
  method: string;
  label: string;
  moneyTransfer: boolean;
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
  econtCodPayOptions,
  setEcontCodPayOptions,
] = useState<EcontCodPayOption[]>([]);

const [
  econtCodPayOptionKey,
  setEcontCodPayOptionKey,
] = useState("");

const [
  econtCodSaving,
  setEcontCodSaving,
] = useState(false);
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

      router.replace("/en/settings");
    }

    if (stripeResult === "refresh") {
      stripeMessage =
        "Stripe setup is not complete. Click “Connect Stripe” again to continue.";

      router.replace("/en/settings");
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
          "Failed to verify the user session."
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
  `Stripe setup is not complete. ` +
  `Missing information: ${missingFields.join(", ")}. ` +
  `Click “Connect Stripe” again to continue.`,
  };
}

if (pendingFields.length > 0) {
  return {
    success: false,
    message:
      "Stripe is reviewing the submitted information. Payments will be activated after the review is complete."
  };
}

return {
  success: false,
message:
  `The Stripe account is not active yet. ` +
  `Reason: ${requirements?.disabledReason || "unknown"}.`,
};
    }

    setStripeEnabled(
      result.stripeEnabled === true
    );

    if (result.stripeEnabled) {
      return {
        success: true,
        message:
          "✅ Stripe account is connected and ready to accept payments."
      };
    }

    return {
      success: false,
      message:
        "The Stripe account has been created, but the setup is not fully complete yet."
    };
  } catch (error) {
    console.error(
      "Stripe status synchronization error:",
      error
    );

    return {
      success: false,
      message:
        "An error occurred while checking the Stripe account."
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
        "Error while checking the user session."
      );

      setLoading(false);
      return;
    }

    if (!session) {
      router.push("/en/login");
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
        "Error while loading the settings."
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
          `Error while reading folder "${folderPath}":`,
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
        "No images were found in banner-templates."
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
        "This banner is available only with a Premium plan."
      );

      return;
    }

    setSelectedBanner(template.id);
    setBannerUrl(template.imageUrl);
    setBannerFile(null);

    setMessage(
      `Template “${template.name}” selected. Click “Save settings”.`
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
        "Error while uploading the image."
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
          "Failed to verify the user session."
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
          "The Econt profile could not be loaded."
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
const codPayOptions = Array.isArray(
  result.profile?.codPayOptions
)
  ? result.profile.codPayOptions
  : [];

setEcontCodPayOptions(
  codPayOptions
);

setEcontCodPayOptionKey(
  result.profile?.codPayOptionKey
    ? String(
        result.profile.codPayOptionKey
      )
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
      "An error occurred while loading the Econt addresses."
    );
  } finally {
    setEcontAddressLoading(false);
  }
}

async function saveEcontSenderAddress() {
  if (!econtSenderAddressId) {
    setMessage(
      "Select a sender address."
    );
    return;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    setMessage(
      "Failed to verify the user session."
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
          "The sender address could not be saved."
      );
      return;
    }

    setMessage(
      "✅ Econt sender address has been saved."
    );
  } catch (error) {
    console.error(
      "Econt sender address save error:",
      error
    );

    setMessage(
      "An error occurred while saving the Econt address."
    );
  } finally {
    setEcontAddressSaving(false);
  }
}
  async function saveEcontCodPayOption() {
  if (!econtCodPayOptionKey) {
    setMessage(
      "Select a cash-on-delivery payout method."
    );
    return;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    setMessage(
     "Failed to verify the user session." 
    );
    return;
  }

  setEcontCodSaving(true);
  setMessage("");

  try {
    const response = await fetch(
      "/api/econt/cod-payment-option",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          codPayOptionKey:
            econtCodPayOptionKey,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok || !result.ok) {
      setMessage(
        result.error ||
          "The payout method could not be saved."
      );
      return;
    }

    setMessage(
      "✅ Cash-on-delivery payout method has been saved."
    );
  } catch (error) {
    console.error(
      "Econt COD option save error:",
      error
    );

    setMessage(
      "An error occurred while saving the Econt payout method."
    );
  } finally {
    setEcontCodSaving(false);
  }
}
async function connectEcont() {
  if (
    !econtUsername.trim() ||
    !econtPassword
  ) {
    setMessage(
      "Enter your Econt username and password."
    );
    return;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    setMessage(
      "Failed to verify the user session."
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
          "The Econt account could not be connected."
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
      "✅ Econt account connected successfully."
    );
  } catch (error) {
    console.error(
      "Econt connect error:",
      error
    );

    setMessage(
      "An error occurred while connecting to Econt."
    );
  } finally {
    setEcontConnecting(false);
  }
}
  async function saveSettings() {
    if (!userId) {
      setMessage(
        "User profile is missing."
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
    "Enter a PayPal payment link."
  );
  setSaving(false);
  return;
}

if (
  revolutEnabled &&
  !revolutPaymentLink.trim()
) {
  setMessage(
    "Enter a Revolut payment link."
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
    "Enter the account holder, IBAN, and bank name."
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
        "Error while saving."
      );

      setSaving(false);
      return;
    }

    setLogoUrl(newLogoUrl);
    setBannerUrl(newBannerUrl);

    setLogoFile(null);
    setBannerFile(null);

    setMessage(
      "Settings saved successfully."
    );

    setSaving(false);
  }
if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">
          ⚙ Store Settings
        </h1>

        <p className="mt-3 text-gray-600">
          Manage your store information and design.
        </p>

        {message && (
          <p className="mt-5 rounded-xl bg-blue-50 p-4 font-semibold text-blue-700">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-8">
          <StoreSettings
            lang="en"
            storeName={storeName}
            description={description}
            phone={phone}
            email={email}
            onStoreNameChange={setStoreName}
            onDescriptionChange={setDescription}
            onPhoneChange={setPhone}
          />

          <PaymentSettings
           lang="en" 
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
    📦 Econt delivery
  </h2>

  <p className="mt-2 text-gray-600">
  Connect your Econt account and allow customers
to choose an Econt office when placing an order.
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
          ✅ Econt account is connected
        </p>

        {econtClientName && (
          <p className="mt-2 text-sm">
            Customer: {econtClientName}
          </p>
        )}

        {econtClientNumber && (
          <p className="mt-1 text-sm">
            Customer number: {econtClientNumber}
          </p>
        )}
      </>
    ) : (
      <p className="font-semibold">
        The Econt account is not connected yet.
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
      placeholder="Econt username"
      autoComplete="username"
      className="w-full rounded-lg border p-3"
    />

    <input
      type="password"
      value={econtPassword}
      onChange={(e) =>
        setEcontPassword(e.target.value)
      }
      placeholder="Econt password"
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
  ? "Connecting..."
  : econtConnected
    ? "Refresh Econt connection"
    : "Connect Econt"}
    </button>
  </div>
{econtConnected && (
  <div className="mt-6 rounded-xl border p-4">
    <label className="block font-semibold">
      Sender address
    </label>

    <p className="mt-1 text-sm text-gray-600">
     Select the address from which you will send
your Econt shipments.
    </p>

    {econtAddressLoading ? (
      <p className="mt-4 text-sm text-gray-600">
        Loading Econt addresses...
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
            Select address
          </option>

          {econtAddresses.map((address) =>
            address.id !== null ? (
              <option
                key={address.id}
                value={String(address.id)}
              >
  {address.street ||
address.quarter ||
address.num ||
address.other
  ? [
      [address.city.name, address.city.postCode]
        .filter(Boolean)
        .join(" "),
      address.quarter
        ? `District ${address.quarter}`
        : "",
      address.street
        ? `Street ${address.street}${
            address.num
              ? ` ${address.num}`
              : ""
          }`
        : "",
      address.other || "",
    ]
      .filter(Boolean)
      .join(", ")
  : address.fullAddress ||
    [address.city.name, address.city.postCode]
      .filter(Boolean)
      .join(" ")}
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
            ? "Saving..."
            :"Save address" }
        </button>
      </>
    ) : (
      <p className="mt-4 text-sm font-semibold text-gray-600">
        No addresses were found in the Econt profile.
      </p>
    )}
  </div>
)}

{econtConnected && (
  <div className="mt-6 rounded-xl border p-4">
    <label className="block font-semibold">
      Cash-on-delivery payout
    </label>

    <p className="mt-1 text-sm text-gray-600">
     Choose how Econt should pay out
your cash-on-delivery amounts.
    </p>

    {econtAddressLoading ? (
      <p className="mt-4 text-sm text-gray-600">
        Loading Econt data...
      </p>
    ) : econtCodPayOptions.length > 0 ? (
      <>
        <select
          value={econtCodPayOptionKey}
          onChange={(e) =>
            setEcontCodPayOptionKey(
              e.target.value
            )
          }
          className="mt-4 w-full rounded-lg border p-3"
        >
          <option value="">
           Select payout method 
          </option>

          {econtCodPayOptions.map(
            (option) => (
              <option
                key={option.key}
                value={option.key}
              >
                {option.label}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={saveEcontCodPayOption}
          disabled={
            econtCodSaving ||
            !econtCodPayOptionKey
          }
          className="mt-3 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {econtCodSaving
            ? "Saving..."
            :"Save payout method"}
        </button>
      </>
    ) : (
      <p className="mt-4 text-sm font-semibold text-gray-600">
       No payout methods were found
in the Econt profile. 
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
      Enable Econt for my store
    </span>
  </label>
</div>
          <SocialSettings
            lang="en"
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
            lang="en"
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
      ?  "Saving..."
      : "💾 Save settings"}
  </button>
</div>
          <UploadSection
            lang="en"
            logoUrl={logoUrl}
            bannerUrl={bannerUrl}
            onLogoFileChange={setLogoFile}
            onBannerFileChange={setBannerFile}
          />

          <BannerGallery
            lang="en"
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
              ?  "Saving..."
              : "💾 Save settings"}
          </button>
        </div>
      </div>
    </main>
  );
}
