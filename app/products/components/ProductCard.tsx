type ProductCardProps = {
  name: string;
  price: string;
  description: string;
  paymentLink: string;
  imageUrl?: string;
};

export default function ProductCard({
  name,
  price,
  description,
  paymentLink,
  imageUrl,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="h-44 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          "Няма снимка"
        )}

      </div>

      <h2 className="text-2xl font-bold">
        {name}
      </h2>

      <p className="mt-2 font-semibold">
        € {price}
      </p>

      <p className="mt-3 text-gray-600">
        {description}
      </p>

      <a
        href={paymentLink}
        target="_blank"
        className="mt-5 block text-center bg-blue-600 text-white rounded-lg py-3"
      >
        Купи
      </a>

    </div>
  );
}