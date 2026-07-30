"use client";
import { supabase } from "@/lib/supabaseClient";
type PaymentSettingsProps = {
  defaultPaymentLink: string;
  onDefaultPaymentLinkChange: (value: string) => void;

  stripeEnabled: boolean;
  onStripeEnabledChange: (value: boolean) => void;

  paypalEnabled: boolean;
  onPaypalEnabledChange: (value: boolean) => void;
paypalPaymentLink: string;
onPaypalPaymentLinkChange: (value: string) => void;
  revolutEnabled: boolean;
  onRevolutEnabledChange: (value: boolean) => void;
revolutPaymentLink: string;
onRevolutPaymentLinkChange: (value: string) => void;
  bankTransferEnabled: boolean;
  onBankTransferEnabledChange: (value: boolean) => void;
bankAccountHolder: string;
onBankAccountHolderChange: (value: string) => void;

bankIban: string;
onBankIbanChange: (value: string) => void;

bankName: string;
onBankNameChange: (value: string) => void;
  codEnabled: boolean;
  onCodEnabledChange: (value: boolean) => void;
};
async function connectStripe() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("Не сте влезли в профила си.");
    return;
  }

  const response = await fetch("/api/stripe/connect", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.error);
    return;
  }

  window.location.href = data.url;
}
export default function PaymentSettings({
  defaultPaymentLink,
  onDefaultPaymentLinkChange,

  stripeEnabled,
  onStripeEnabledChange,

paypalEnabled,
onPaypalEnabledChange,
paypalPaymentLink,
onPaypalPaymentLinkChange,

revolutEnabled,
onRevolutEnabledChange,
revolutPaymentLink,
onRevolutPaymentLinkChange,

bankTransferEnabled,
onBankTransferEnabledChange,
bankAccountHolder,
onBankAccountHolderChange,
bankIban,
onBankIbanChange,
bankName,
onBankNameChange,

  codEnabled,
  onCodEnabledChange,
}: PaymentSettingsProps) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow space-y-8">
      <div>
        <h2 className="text-2xl font-bold">
          💳 Payment Settings
        </h2>

        <p className="mt-2 text-gray-500">
          Configure your preferred payment methods.
        </p>
      </div>

      <div>
        <label className="font-semibold">
          Default Payment Link
        </label>

        <input
          value={defaultPaymentLink}
          onChange={(event) =>
            onDefaultPaymentLinkChange(event.target.value)
          }
          placeholder="https://..."
          className="mt-2 w-full rounded-lg border p-3"
        />

        <p className="mt-2 text-sm text-gray-500">
          This link will automatically appear when creating new products.
        </p>
      </div>

      <div className="rounded-xl border p-5">
        <h3 className="text-lg font-semibold">
          Available payment methods
        </h3>

        <div className="mt-5 space-y-3">
       <div>
  <label className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={stripeEnabled}
      onChange={(event) =>
        onStripeEnabledChange(event.target.checked)
      }
    />
    Stripe
  </label>

  <button
    type="button"
    onClick={connectStripe}
    className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-white"
  >
    Свържи Stripe
  </button>
</div>

  <div>
  <label className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={paypalEnabled}
      onChange={(event) =>
        onPaypalEnabledChange(event.target.checked)
      }
    />
    PayPal
  </label>

  {paypalEnabled && (
    <input
      value={paypalPaymentLink}
      onChange={(event) =>
        onPaypalPaymentLinkChange(event.target.value)
      }
      placeholder="https://paypal.me/вашето-име"
      className="mt-3 w-full rounded-lg border p-3"
    />
  )}
</div>


          <div>
  <label className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={revolutEnabled}
      onChange={(event) =>
        onRevolutEnabledChange(event.target.checked)
      }
    />
    Revolut
  </label>

  {revolutEnabled && (
    <input
      value={revolutPaymentLink}
      onChange={(event) =>
        onRevolutPaymentLinkChange(event.target.value)
      }
      placeholder="https://revolut.me/вашето-име"
      className="mt-3 w-full rounded-lg border p-3"
    />
  )}
</div>

          <div>
  <label className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={bankTransferEnabled}
      onChange={(event) =>
        onBankTransferEnabledChange(event.target.checked)
      }
    />
    Bank Transfer
  </label>

  {bankTransferEnabled && (
    <div className="mt-3 space-y-3">
      <input
        value={bankAccountHolder}
        onChange={(event) =>
          onBankAccountHolderChange(event.target.value)
        }
        placeholder="Титуляр на банковата сметка"
        className="w-full rounded-lg border p-3"
      />

      <input
        value={bankIban}
        onChange={(event) =>
          onBankIbanChange(event.target.value)
        }
        placeholder="IBAN"
        className="w-full rounded-lg border p-3"
      />

      <input
        value={bankName}
        onChange={(event) =>
          onBankNameChange(event.target.value)
        }
        placeholder="Име на банката"
        className="w-full rounded-lg border p-3"
      />
    </div>
  )}
</div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(event) =>
                onCodEnabledChange(event.target.checked)
              }
            />
            Cash on Delivery
          </label>
        </div>
      </div>
    </section>
  );
}