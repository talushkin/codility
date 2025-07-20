import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import dayjs from "dayjs";
import type { Recipe } from "../utils/storage";

interface CaseCardProps {
  item: Recipe;
  category: string;
  index?: number;
  isDarkMode?: boolean;
}

export default function CaseCard({ item, category, index, isDarkMode }: CaseCardProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [translatedTitle, setTranslatedTitle] = useState<string>(item.title);
  const [imageUrl, setImageUrl] = useState<string>(item.imageUrl || "https://placehold.co/100x100?text=No+Image");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const translateField = async () => {
      setIsLoading(true);
      try {
        const title = await translateDirectly(item.title, currentLang);
        if (isMounted) setTranslatedTitle(title);
      } catch (error) {
        if (isMounted) setTranslatedTitle(item.title);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (item && currentLang !== "en") {
      translateField();
    } else {
      setTranslatedTitle(item.title);
    }
    return () => { isMounted = false; };
  }, [item, currentLang, setTranslatedTitle]);

  useEffect(() => {
    setImageUrl(item.imageUrl || "https://placehold.co/100x100?text=No+Image");
  }, [item.imageUrl]);

  // Removed unused: isNewRecipe, linkHref

  return (
    <div
      className={`case case-index-${index !== undefined ? index : "unknown"}`}
      id={`case-index-${index !== undefined ? index : "unknown"}`}
      style={{
        backgroundColor: isDarkMode ? "#333" : "#fffce8",
        border: isDarkMode
          ? "1px solid rgb(71, 69, 69)"
          : "1px solid rgb(234, 227, 227)",
        borderRadius: "18px",
        transition: "border 0.2s",
      }}
    >
      <img
        src={imageUrl}
        alt={translatedTitle}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/100x100?text=${encodeURIComponent(item.title)}`;
        }}
      />
      <h2>{isLoading ? t("loading") : translatedTitle}</h2>
      <p style={{ color: isDarkMode ? "#fff" : "#333" }}>
        {item.createdAt ? ` ${dayjs(item.createdAt).format("DD-MM-YYYY")}` : ""}
      </p>
    </div>
  );
}
