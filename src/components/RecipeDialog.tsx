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

interface RecipeDialogProps {
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

const RecipeDialog = ({
  open,
  onClose,
  onSave,
  onDelete,
  recipe,
  targetLang = "en",
  type,
  categoryName,
  autoFill = false,
}: RecipeDialogProps) => {


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
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [descError, setDescError] = useState("");

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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | null | undefined
  ) => {
    if (!field || !event?.target) return;
    const value = event.target.value;
   // console.log("Field changed:", field, ":", value);
    if (field === "title") {
      if
        (!/^[a-zA-Z ]+$/.test(value)) {
        setNameError("Name must contain only letters and spaces");
        //console.log("Invalid name input:", event?.target.value);
      } else {
        setNameError("")
        setEditableRecipe((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      }
    } else
      if (field === "price") {
        const priceValue = parseFloat(value);
        if (isNaN(priceValue) || priceValue <= 0) {
          setPriceError("Price must be a valid number");
        } else {
          setPriceError("");
          setEditableRecipe((prev) => ({
            ...prev,
            [field]: priceValue,
          }));
        }
      } else if (field === "description") {
        if
          (!/^[a-zA-Z ]+$/.test(value)) {
          setDescError("Description must contain only letters and spaces");
          //console.log("Invalid name input:", event?.target.value);
        } else {
          setDescError("")
          setEditableRecipe((prev) => ({
            ...prev,
            [field]: event.target.value,
          }));
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
    <Dialog
      open={open || false}
      onClose={onClose}
      dir={isRTL ? "rtl" : "ltr"}
      PaperProps={{
        style: {
          maxWidth: "98vw",
          width: "98vw",
          maxHeight: "98vh",
          height: "98vh",
          borderRadius: "24px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          background: "rgb(247, 241, 227)",
          overflow: "auto",
        },
      }}
      disableEscapeKeyDown={false} // Allow ESC to close
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <DialogTitle
        style={{
          backgroundColor: "#f7f1e3",
          textAlign: "center",
          padding: "10px",
          fontSize: "2.8rem", // Enlarged title text
          fontWeight: "bold",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          position: "relative",
          minHeight: "60px",
        }}
      >
        {editableRecipe.title}
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
      </DialogTitle>

      <Box position="relative">

        <DialogContent
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
              label="New Product Name"
              placeholder="Enter product name"
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
              multiline
              rows={4}
              margin="normal"
            />
          </Box>
        </DialogContent>
      </Box>

      <DialogActions
        sx={{
          display: "flex",
          gap: 2,
          width: "100%",
          justifyContent: "center",
          background: "rgb(247, 241, 227)", // Set background color for actions area
          "& > button": {
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            paddingLeft: 2,
            paddingRight: 2,
            height: "48px",
            fontWeight: "bold",
            borderRadius: "10px",
          },
        }}
      >
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
        onClick={handleSave}
         variant="contained"
         disabled={!editableRecipe.title || !editableRecipe.price || !!nameError || !!priceError || !!descError}>
          Add product
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDialog;
