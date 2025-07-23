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

  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [descError, setDescError] = useState("");
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
        createdAt: recipe?.createdAt || "",
        imageUrl: recipe.imageUrl || "",
        _id: recipe._id,
      });
    }
  }, [recipe]);


  const handleChange = (field: keyof Recipe) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | null | undefined
  ) => {
    if (!field || !event?.target) return;
    const value = event.target.value;
//    console.log("Field changed:", field, ":", value);
    if (field === "title") {
      setEditableRecipe((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      if
        (!/^[a-zA-Z ]+$/.test(value)) {
        setNameError("Name must contain only letters and spaces");
        //console.log("Invalid name input:", event?.target.value);
      } else {
        setNameError("")

      }
    } else
      if (field === "price") {
        const priceValue = parseFloat(value);
    //    console.log("Price changed:", priceValue);
        if (isNaN(priceValue) || priceValue < 0) {
          setEditableRecipe((prev) => ({
            ...prev,
            [field]: 0,
          }))
          setPriceError("Price must be a valid number");
        } else {
          setEditableRecipe((prev) => ({
            ...prev,
            [field]: value,
          }))
          setPriceError("");

        }
      } else if (field === "description") {
        setEditableRecipe((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
        if
          (!/^[a-zA-Z ]+$/.test(value)) {
          setDescError("Description must contain only letters and spaces");
          //console.log("Invalid name input:", event?.target.value);
        } else {
          setDescError("")

        }
      }

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
              inputProps={{
                pattern: "[A-Za-z ]+",
              }}
              required
              error={!!nameError}
              helperText={nameError}
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
              error={!!descError}
              helperText={descError}
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
              error={!!priceError}
              helperText={priceError}
              label={"Price in $"}
              value={editableRecipe.price}
              onChange={handleChange("price")}
              fullWidth
              rows={1}
              margin="normal"
            />
          </Box>
        </div>
        {/* <Button
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
        </Button> */}
        <Button 
        disabled={!!nameError || !!priceError || !!descError}
        onClick={handleSave} 
        variant="contained">
          Update
        </Button>
        {/* <Button onClick={onClose} variant="contained" color="primary">
          close
        </Button> */}
      </Box>
    </>
  );


}

export default ProductDetails;
