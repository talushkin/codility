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
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import type { Recipe } from "../utils/types";
import { uploadImageToLocalStorage, validateImageFile, getImageFromLocalStorage } from "../utils/storage";

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
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // File input ref for image upload
  const fileInputRef = React.createRef<HTMLInputElement>();

  // Handle image file selection
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the image file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setIsUploadingImage(true);

    try {
      // Upload image to localStorage and get data URL
      const recipeId = editableRecipe._id || 'temp_' + Date.now().toString();
      const imageUrl = await uploadImageToLocalStorage(file, recipeId);
      
      // Update the recipe with new image URL
      setEditableRecipe(prev => ({
        ...prev,
        imageUrl: imageUrl,
        _id: prev._id || recipeId // Set ID if it was temporary
      }));

      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    // Reset to English when dialog opens or recipe changes
    setShowTranslated(false);
    
    // Try to load stored image if recipe has an ID
    let imageUrl = recipe?.imageUrl || "";
    if (recipe?._id && !imageUrl) {
      const storedImage = getImageFromLocalStorage(recipe._id);
      if (storedImage) {
        imageUrl = storedImage;
      }
    }
    
    setEditableRecipe({
      title: recipe?.title || "",
      description: recipe?.description || "",
      preparation: recipe?.preparation || "",
      price: recipe?.price || 0,
      createdAt: recipe?.createdAt || "",
      imageUrl: imageUrl,
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
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {/* Clickable image container */}
            <Box
              onClick={handleImageClick}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                borderRadius: '28px',
                overflow: 'hidden',
                '&:hover': {
                  opacity: 0.8,
                  transform: 'scale(1.02)',
                },
                '&:hover .camera-icon': {
                  opacity: 1,
                  transform: 'scale(1.1)',
                },
                '&:hover .upload-hint': {
                  opacity: 1,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isUploadingImage && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  bgcolor="rgba(0,0,0,0.5)"
                  zIndex={2}
                  borderRadius="28px"
                >
                  <CircularProgress color="primary" />
                </Box>
              )}
              
              {/* Camera icon overlay */}
              <Box
                className="camera-icon"
                position="absolute"
                top="50%"
                left="50%"
                sx={{
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.7,
                  transition: 'all 0.3s ease',
                  zIndex: 1,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CameraAltIcon 
                  sx={{ 
                    fontSize: '2rem', 
                    color: 'white',
                  }} 
                />
              </Box>
              
              <img
                src={
                  editableRecipe.imageUrl ||
                  "https://placehold.co/300x200?text=Click+to+Upload+Image"
                }
                alt={editableRecipe.title || "Product image"}
                style={{ 
                  maxHeight: "200px", 
                  borderRadius: "28px",
                  maxWidth: "100%",
                  objectFit: "cover"
                }}
              />
              
              {/* Upload overlay hint */}
              <Box
                className="upload-hint"
                position="absolute"
                bottom={8}
                right={8}
                bgcolor="rgba(0,0,0,0.7)"
                color="white"
                px={1}
                py={0.5}
                borderRadius={1}
                fontSize="0.75rem"
                sx={{ 
                  opacity: 0.6,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <EditIcon sx={{ fontSize: '0.875rem' }} />
                Click to change
              </Box>
            </Box>
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

          {/* Created At field - read-only */}
          <Box position="relative">
            <TextField
              label="Created At"
              value={editableRecipe.createdAt ? new Date(editableRecipe.createdAt).toLocaleString("en-GB") : "Not set"}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
                style: {
                  backgroundColor: "#f5f5f5",
                  color: "#666",
                },
              }}
              InputLabelProps={{
                style: {
                  color: "#666",
                },
              }}
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
