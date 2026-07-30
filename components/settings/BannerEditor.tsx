"use client";

import type {
  BannerTextColor,
  BannerTextPosition,
} from "./types";

type BannerEditorProps = {
  bannerUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  textColor: BannerTextColor;
  textPosition: BannerTextPosition;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onButtonTextChange: (value: string) => void;
  onTextColorChange: (value: BannerTextColor) => void;
  onTextPositionChange: (value: BannerTextPosition) => void;
};

function getTextClass(color: BannerTextColor) {
  if (color === "black") return "text-black";
  if (color === "gold") return "text-yellow-300";
  if (color === "blue") return "text-blue-300";
  return "text-white";
}

function getPositionClass(position: BannerTextPosition) {
  if (position === "left") return "items-start text-left";
  if (position === "right") return "items-end text-right";
  return "items-center text-center";
}

export default function BannerEditor({
  bannerUrl,
  title,
  subtitle,
  buttonText,
  textColor,
  textPosition,
  onTitleChange,
  onSubtitleChange,
  onButtonTextChange,
  onTextColorChange,
  onTextPositionChange,
}: BannerEditorProps) {
  const textClass = getTextClass(textColor);
  const positionClass = getPositionClass(textPosition);

  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold">✍️ Редактор на банера</h2>

      <div className="mt-6 overflow-hidden rounded-2xl border shadow">
        {bannerUrl ? (
          <div className="relative">
            <img
              src={bannerUrl}
              alt="Преглед на банера"
              className="h-72 w-full object-cover"
            />

            <div
              className={`absolute inset-0 flex flex-col justify-center p-6 md:p-10 ${positionClass}`}
            >
              {title && (
                <h3 className={`text-3xl font-bold md:text-5xl ${textClass}`}>
                  {title}
                </h3>
              )}

              {subtitle && (
                <p className={`mt-4 text-lg md:text-xl ${textClass}`}>
                  {subtitle}
                </p>
              )}

              {buttonText && (
                <span className="mt-7 inline-block rounded-xl bg-white px-7 py-3 font-bold text-black">
                  {buttonText}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center bg-gray-200 text-gray-500">
            Изберете или качете банер.
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-5">
        <div>
          <label className="font-semibold">Заглавие</label>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Например: Summer Sale"
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">Подзаглавие</label>
          <input
            value={subtitle}
            onChange={(event) => onSubtitleChange(event.target.value)}
            placeholder="Например: До 50% намаление"
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">Текст на бутона</label>
          <input
            value={buttonText}
            onChange={(event) => onButtonTextChange(event.target.value)}
            placeholder="Например: Купи сега"
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">Цвят на текста</label>
          <select
            value={textColor}
            onChange={(event) =>
              onTextColorChange(event.target.value as BannerTextColor)
            }
            className="mt-2 w-full rounded-lg border p-3"
          >
            <option value="white">Бял</option>
            <option value="black">Черен</option>
            <option value="gold">Златен</option>
            <option value="blue">Син</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Позиция на текста</label>
          <select
            value={textPosition}
            onChange={(event) =>
              onTextPositionChange(
                event.target.value as BannerTextPosition
              )
            }
            className="mt-2 w-full rounded-lg border p-3"
          >
            <option value="left">Ляво</option>
            <option value="center">Център</option>
            <option value="right">Дясно</option>
          </select>
        </div>
      </div>
    </section>
  );
}
