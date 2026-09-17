"use client";

import { useEffect, useState } from "react";

type EcontCity = {
  id: number;
  name: string;
  postCode?: string | null;
};

type EcontOffice = {
  id: number;
  code?: string;
  name: string;
  address?: {
    fullAddress?: string | null;
  };
};
export type EcontSelection = {
  cityId: number;
  cityName: string;
  postCode?: string | null;
  officeId: number;
  officeCode?: string | null;
  officeName: string;
  officeAddress?: string | null;
};

type EcontDeliveryPickerProps = {
  ownerId?: string;
  onChange?: (selection: EcontSelection | null) => void;
  language?: "bg" | "en";
};

export default function EcontDeliveryPicker({
  ownerId,
  onChange,
  language = "bg",
}: EcontDeliveryPickerProps) {
  const [cities, setCities] = useState<EcontCity[]>([]);
  const [cityId, setCityId] = useState("");
  const [offices, setOffices] = useState<EcontOffice[]>([]);
  const [officeId, setOfficeId] = useState("");

  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [error, setError] = useState("");
const selectedCity = cities.find(
  (city) => String(city.id) === cityId
);

const selectedOffice = offices.find(
  (office) => String(office.id) === officeId
);
  const isEnglish = language === "en";
  useEffect(() => {
    let isActive = true;

    async function loadCities() {
      try {
        setError("");

      const citiesUrl = ownerId
  ? `/api/econt/public/cities?ownerId=${encodeURIComponent(
      ownerId
    )}`
  : "/api/econt/cities";

const response = await fetch(citiesUrl, {
  cache: "no-store",
});

        const data = (await response.json()) as {
          ok?: boolean;
          cities?: EcontCity[];
        };

        if (!response.ok || !data.ok) {
          throw new Error("Econt cities request failed.");
        }

        if (isActive) {
          setCities(data.cities || []);
        }
      } catch {
        if (isActive) {
         setError(
  language === "en"
    ? "Econt cities could not be loaded."
    : "Градовете на Econt не можаха да бъдат заредени."
);
        }
      } finally {
        if (isActive) {
          setLoadingCities(false);
        }
      }
    }

    void loadCities();

    return () => {
      isActive = false;
    };
  }, [ownerId, language]);

  async function handleCityChange(nextCityId: string) {
    setCityId(nextCityId);
    setOfficeId("");
    setOffices([]);
    setError("");
onChange?.(null);
    if (!nextCityId) {
      return;
    }

    try {
      setLoadingOffices(true);
const officesUrl = ownerId
  ? `/api/econt/public/offices?ownerId=${encodeURIComponent(
      ownerId
    )}&cityId=${encodeURIComponent(nextCityId)}`
  : `/api/econt/offices?cityId=${encodeURIComponent(
      nextCityId
    )}`;

const response = await fetch(officesUrl, {
  cache: "no-store",
});

      const data = (await response.json()) as {
        ok?: boolean;
        offices?: EcontOffice[];
      };

      if (!response.ok || !data.ok) {
        throw new Error("Econt offices request failed.");
      }

      setOffices(data.offices || []);
    } catch {
    setError(
  language === "en"
    ? "Econt offices could not be loaded."
    : "Офисите на Econt не можаха да бъдат заредени."
);
    } finally {
      setLoadingOffices(false);
    }
  }
function handleOfficeChange(nextOfficeId: string) {
  setOfficeId(nextOfficeId);

  if (!nextOfficeId) {
    onChange?.(null);
    return;
  }

  const city = cities.find(
    (item) => String(item.id) === cityId
  );

  const office = offices.find(
    (item) => String(item.id) === nextOfficeId
  );

  if (!city || !office) {
    onChange?.(null);
    return;
  }

onChange?.({
  cityId: city.id,
  cityName: city.name,
  postCode: city.postCode,
  officeId: office.id,
  officeCode: office.code || null,
  officeName: office.name,
  officeAddress: office.address?.fullAddress,
});
}
  return (
    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
    <p className="mb-4 font-semibold text-green-800">
  {isEnglish ? "📦 Econt delivery" : "📦 Econt доставка"}
</p>

<label className="mb-2 block font-semibold">
  {isEnglish ? "City" : "Населено място"}
</label>

      <select
        value={cityId}
        onChange={(e) => void handleCityChange(e.target.value)}
        disabled={loadingCities}
        className="mb-4 w-full rounded-lg border p-3"
      >
        <option value="">
        {loadingCities
  ? isEnglish
    ? "Loading cities..."
    : "Зареждане на населените места..."
  : isEnglish
    ? "Select a city"
    : "Изберете населено място"}
        </option>

        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
            {city.postCode ? ` (${city.postCode})` : ""}
          </option>
        ))}
      </select>

      <label className="mb-2 block font-semibold">
  {isEnglish ? "Econt office" : "Офис на Econt"}
</label>

      <select
        value={officeId}
        onChange={(e) => handleOfficeChange(e.target.value)}
        disabled={!cityId || loadingOffices}
        className="w-full rounded-lg border p-3"
      >
        <option value="">
        {loadingOffices
  ? isEnglish
    ? "Loading offices..."
    : "Зареждане на офисите..."
  : cityId
    ? isEnglish
      ? "Select an office"
      : "Изберете офис"
    : isEnglish
      ? "Select a city first"
      : "Първо изберете населено място"}
        </option>

        {offices.map((office) => (
          <option key={office.id} value={office.id}>
            {office.name}
            {office.address?.fullAddress
              ? ` — ${office.address.fullAddress}`
              : ""}
          </option>
        ))}
      </select>

{cityId && !loadingOffices && offices.length > 0 && (
  <p className="mt-3 text-sm text-gray-600">
    {isEnglish ? "Offices found" : "Намерени офиси"}:{" "}
    {offices.length}
  </p>
)}

{selectedCity && selectedOffice && (
  <div className="mt-4 rounded-lg border border-green-300 bg-white p-4">
    <p className="font-semibold text-green-800">
      {isEnglish
        ? "✅ Selected Econt delivery"
        : "✅ Избрана Econt доставка"}
    </p>

    <p className="mt-2 text-sm text-gray-700">
      <strong>
        {isEnglish ? "City:" : "Населено място:"}
      </strong>{" "}
      {selectedCity.name}
      {selectedCity.postCode
        ? ` (${selectedCity.postCode})`
        : ""}
    </p>

    <p className="mt-2 text-sm text-gray-700">
      <strong>
        {isEnglish ? "Office:" : "Офис:"}
      </strong>{" "}
      {selectedOffice.name}
    </p>

    {selectedOffice.address?.fullAddress && (
      <p className="mt-2 text-sm text-gray-600">
        <strong>
          {isEnglish ? "Address:" : "Адрес:"}
        </strong>{" "}
        {selectedOffice.address.fullAddress}
      </p>
    )}
  </div>
)}
      {error && (
        <p className="mt-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      
    </div>
  );
}
