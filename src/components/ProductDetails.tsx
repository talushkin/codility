import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import type { Recipe } from "../utils/types";

const BASE_URL = "https://be-tan-theta.vercel.app";

interface ProductDetailsProps {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  recipe: Recipe;
  targetLang?: string;
  type?: string;
  categoryName?: string;
  autoFill?: boolean;
}

const ProductDetails = ({
  open,
  onClose,
  onSave,
  onDelete,
  recipe,
  targetLang = "en",
  type,
  categoryName,
  autoFill = false,
}: ProductDetailsProps) => {


  const [editableRecipe, setEditableRecipe] = useState<Recipe>({
    title: recipe?.title || "",
    description: recipe?.description || "",
    preparation: recipe?.preparation || "",
    price: recipe?.price || 0,
    createdAt: recipe?.createdAt || "",
    imageUrl: recipe?.imageUrl || "",
    _id: recipe?._id,
  });
  const isRTL: Boolean = false; // Assuming you have a way to determine if the language is RTL

  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [showTranslated, setShowTranslated] = useState<boolean>(false);

  useEffect(() => {
    // Reset to English when dialog opens or recipe changes
    setShowTranslated(false);
    setEditableRecipe({
      title: recipe?.title || "",
      description: recipe?.description || "",
      preparation: recipe?.preparation || "",
      price: recipe?.price || 0,
      createdAt: recipe?.createdAt || "",
      imageUrl: recipe?.imageUrl || "",
      _id: recipe?._id,
    });
  }, [recipe, open]);

  useEffect(() => {
    if (recipe) {
      setEditableRecipe({
        title: recipe.title || "",
        price: recipe.price || 0,
        description: recipe.description || "",
        preparation: recipe.preparation || "",
        imageUrl: recipe.imageUrl || "",
        _id: recipe._id,
      });
    }
  }, [recipe]);


  const handleChange = (field: keyof Recipe) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditableRecipe((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    onSave(editableRecipe);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      setEditableRecipe((prev) => ({ ...prev, _id: recipe?._id }));
      onDelete(editableRecipe);
      onClose();
    }
  };

  return (
<>
       {/* {editableRecipe.title} */}
        <IconButton
          onClick={onClose}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: "bold", lineHeight: 1 }}>×</span>
        </IconButton>

      <Box position="relative">

        <div 
          style={{
            backgroundColor: "#f7f1e3",
          }}
        >
          <Box
            position="relative"
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginBottom={2}
            style={{ minHeight: "180px" }}
          >
            <img
              src={
                editableRecipe.imageUrl ||
                "https://placehold.co/100x100?text=No+Image"
              }
              alt={editableRecipe.title}
              style={{ maxHeight: "300px", borderRadius: "28px" }}
            />

          </Box>

          <Box position="relative">
            <TextField
              type="text"
              label="Product Name"
              value={editableRecipe.title}
              onChange={handleChange("title")}
              fullWidth
              margin="normal" 
              InputProps={{
                style: {
                  fontSize: "2rem",
                  fontWeight: "bold",
                },

              }}
              InputLabelProps={{
                style: {
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                },
              }}
            />
          </Box>

          <Box position="relative">
            <TextField
              label={"description"}
              value={editableRecipe.description}
              onChange={handleChange("description")}
              fullWidth
              multiline
              rows={4}
              margin="normal"

            />

          </Box>

          <Box position="relative">
            <TextField
              type="number"
              label={"Price in $"}
              value={editableRecipe.price}
              onChange={handleChange("price")}
              fullWidth
              multiline
              rows={4}
              margin="normal"
            />
          </Box>
        </div>
          <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          sx={{
            background: "#fff",
            color: "#d32f2f",
            border: "1px solid #d32f2f",
            "&:hover": {
              background: "#f7f1e3",
              color: "#b71c1c",
              border: "1px solid #b71c1c",
            },
          }}
        >
          delete
        </Button>
        <Button onClick={handleSave} variant="contained">
          save
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          close
        </Button>
      </Box>
    </>
  );


}

export default ProductDetails;
