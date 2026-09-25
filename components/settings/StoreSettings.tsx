"use client";

type StoreSettingsProps = {
  storeName: string;
  description: string;
  phone: string;
  email: string;
  lang?: "bg" | "en";
  onStoreNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export default function StoreSettings({
  storeName,
  description,
  phone,
  email,
  lang = "bg",
  onStoreNameChange,
  onDescriptionChange,
  onPhoneChange,
}: StoreSettingsProps) {
  const isEnglish = lang === "en";

  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold">
        🏪 {isEnglish ? "Basic information" : "Основна информация"}
      </h2>

      <div className="mt-6 grid gap-6">
        <div>
          <label className="font-semibold">
            {isEnglish ? "Store name" : "Име на магазина"}
          </label>

          <input
            value={storeName}
            onChange={(event) =>
              onStoreNameChange(event.target.value)
            }
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">
            {isEnglish ? "Description" : "Описание"}
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              onDescriptionChange(event.target.value)
            }
            className="mt-2 h-32 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">
            {isEnglish ? "Phone" : "Телефон"}
          </label>

          <input
            value={phone}
            onChange={(event) =>
              onPhoneChange(event.target.value)
            }
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">
            Email
          </label>

          <input
            value={email}
            disabled
            className="mt-2 w-full rounded-lg border bg-gray-100 p-3"
          />
        </div>
      </div>
    </section>
  );
}
