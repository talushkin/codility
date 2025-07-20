import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import { useDispatch } from "react-redux";
import { addCategoryThunk, reorderCategoriesThunk, delCategoryThunk } from "../store/dataSlice";
import { Button } from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import i18n from "../i18n";
import type { Category, Categories } from "../utils/storage";

const isRTL = i18n.dir() === "rtl";

// Add priority to Category type for sorting
interface CategoryWithPriority extends Category {
  priority: number;
  translatedCategoryObj?: { [lang: string]: string };
}

interface SortableItemProps {
  item: Category;
  index: number;
  onSelect: (item: Category) => void;
  editCategories: boolean;
  translatedCategory: string;
  delCategoryCallback: (id: string) => void;
}

// A sortable item component using dnd‑kit
function SortableItem({
  item,
  index,
  onSelect,
  editCategories,
  translatedCategory,
  delCategoryCallback,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Compute recipe count for this category
  const recipeCount = item.itemPage?.length || 0;

  // Get the image URL from the first recipe in the category, if available
  const firstRecipeImage =
    item.itemPage && item.itemPage.length > 0
      ? item.itemPage[0].imageUrl
      : "https://placehold.co/40x40?text=No+Image";

  return (
    <li
      ref={setNodeRef}
      style={style}
      dir={isRTL ? "rtl" : "ltr"}
      className="nav-item flex items-center justify-start nowrap" // added "nav-item" class
      {...attributes}
      {...listeners}
    >
      {editCategories && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (window.confirm("Delete ? `" + translatedCategory + "`")) {
                delCategoryCallback(item._id);
              }
            }}
          >
            🗑
          </button>
          ☰
        </>
      )}
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex-1 flex items-center nav-link-button"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        {editCategories && index + 1 + ". "}
        <img
          src={firstRecipeImage}
          alt="Category"
          style={{
            width: "40px",
            height: "40px",
            marginRight: "0.5rem",
            marginLeft: "0.5rem",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        {translatedCategory || item.category}{" "}
        <span
          className="text-gray-500 ml-2"
        >
          ({recipeCount})
        </span>
      </button>

    </li>
  );
}

interface NavItemListProps {
  categories: Categories;
  onSelect: (item: Category) => void;
  editCategories: boolean;
  onOrderChange?: (items: Categories) => void;
  setReorder: (val: boolean) => void;
}

export default function NavItemList({
  categories = [],
  onSelect,
  editCategories,
  onOrderChange,
  setReorder,
}: NavItemListProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // Convert incoming categories to CategoryWithPriority[]
  const toCategoryWithPriority = useCallback((cat: Category, idx: number): CategoryWithPriority => ({
    ...cat,
    priority: (cat as any).priority ?? idx + 1,
    translatedCategoryObj: {},
  }), []);
  const [items, setItems] = useState<CategoryWithPriority[]>(categories.map(toCategoryWithPriority));
  const [inputValue, setInputValue] = useState<string>("");
  const [newCat, setNewCat] = useState<boolean>(false);

  // Sync items with categories when categories change
  useEffect(() => {
    setItems(categories.map(toCategoryWithPriority));
  }, [categories, toCategoryWithPriority]);

  // Translate category names and cache them per language
  useEffect(() => {
    const translateCategories = async () => {
      if (categories.length === 0) return;
      const lang = i18n.language;
      const newItems = await Promise.all(
        categories.map(async (item, idx) => {
          let translatedCategoryObj = (items[idx] && items[idx].translatedCategoryObj) || {};
          if (!translatedCategoryObj[lang]) {
            translatedCategoryObj[lang] = await translateDirectly(item.category, lang);
          }
          return {
            ...toCategoryWithPriority(item, idx),
            translatedCategoryObj,
          };
        })
      );
      setItems(newItems);
    };
    translateCategories();
  }, [categories, i18n.language, items, toCategoryWithPriority]);

  const handleAddItem = async () => {
    setNewCat(false);
    if (inputValue.trim() === "") return;
    // Translate the category to English before saving
    let englishCategory = inputValue.trim();
    try {
      englishCategory = await translateDirectly(inputValue.trim(), "en");
    } catch (e) {
      // fallback to original if translation fails
      englishCategory = inputValue.trim();
    }
    const newItem: CategoryWithPriority = {
      _id: String(Date.now() + Math.random()),
      category: englishCategory,
      itemPage: [],
      priority: items.length + 1,
      translatedCategoryObj: { [i18n.language]: inputValue.trim() },
    };
    dispatch(addCategoryThunk(englishCategory) as any);
    setItems([...items, newItem]);
    setInputValue("");
  };

  // Callback when drag ends: update order, set new priorities, persist via redux
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    console.log("Drag ended", active, over);
    if (!over) return; // No item was dropped
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      let newItems = arrayMove(items, oldIndex, newIndex);
      // Update each item's priority based on its new index
      newItems = newItems.map((item, idx) => ({ ...item, priority: idx + 1 }));
      console.log("Moved items", newItems);
      setItems(newItems);
      dispatch(reorderCategoriesThunk(newItems) as any);
      // Notify parent if needed
      onOrderChange && onOrderChange(newItems as Category[]);
      setReorder(true);
    }
  };

  // Callback to delete an item from state using redux thunk
  const handleDelCategory = (id: string) => {
    const categoryToDelete = items.find((i) => i._id === id)?.category || "";
    dispatch(delCategoryThunk({ categoryId: id, categoryName: categoryToDelete }) as any);
    setItems((prevItems) => prevItems.filter((i) => i._id !== id));
  };

  // Sort items by priority before rendering
  const sortedItems = [...items].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  return (
    <>
      <DndContext sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortedItems.map((item) => item._id)} strategy={verticalListSortingStrategy}>
          {sortedItems.map((item, index) => (
            <SortableItem
              key={item._id}
              item={item}
              index={index}
              onSelect={onSelect}
              editCategories={editCategories}
              translatedCategory={
                item.translatedCategoryObj && item.translatedCategoryObj[i18n.language]
                  ? item.translatedCategoryObj[i18n.language]
                  : item.category
              }
              delCategoryCallback={handleDelCategory}
            />
          ))}
        </SortableContext>
      </DndContext>
      {!newCat && (
        <Button
          variant="contained"
          onClick={() => setNewCat(true)}
          sx={{
            backgroundColor: "darkgreen",
            "&:hover": {
              backgroundColor: "green",
              "& .MuiSvgIcon-root": {
                color: "black",
              },
            },
          }}
        >
          + {t("addCategory")}
        </Button>
      )}
      {newCat && (
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder={t("addCategory") as string}
            value={inputValue}
            autoFocus
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Escape" || e.key === "x" || e.key === "X") {
                setNewCat(false);
                setInputValue("");
              }
              if (e.key === "Enter") {
                handleAddItem();
              }
            }}
            className="p-2 rounded w-full"
            style={{
              width: "calc(100% - 0.25rem)",
              minWidth: "80px",
              maxWidth: "calc(100% - 0.25rem)",
            }}
          />
          <button
            type="button"
            onClick={() => {
              setNewCat(false);
              setInputValue("");
            }}
            style={{
              width: "20%",
              minWidth: "40px",
              maxWidth: "60px",
              background: "darkgreen",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
