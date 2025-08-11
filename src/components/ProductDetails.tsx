// External modules
import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import SmartToyIcon from "@mui/icons-material/SmartToy";

// Types
import type { Product } from "../utils/types";

// Utils
import { uploadImageToLocalStorage, validateImageFile, getImageFromLocalStorage, updateProduct } from "../utils/storage";

// Components
import { generateImage } from "./generateAI";

interface ProductDetailsProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  onDelete?: (product: Product) => void;
  product: Product;
  targetLang?: string;
  type?: string;
  categoryName?: string;
  autoFill?: boolean;
  onImageUpdate?: (product: Product) => void; // New callback for real-time image updates
}

const ProductDetails = ({
  open,
  onClose,
  onSave,
  //onDelete,
  product,
  onImageUpdate, // New callback prop
}: ProductDetailsProps) => {

  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [descError, setDescError] = useState("");
  const [editableProduct, setEditableProduct] = useState<Product>({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || 0,
    createdAt: product?.createdAt || "",
    imageUrl: product?.imageUrl || "",
    _id: product?._id,
  });
  const [, setShowTranslated] = useState<boolean>(false);   
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(""); // Track current image for immediate display
  const fileInputRef = React.createRef<HTMLInputElement>();

  // Handle AI image generation
  const handleGenerateImage = async () => {
    if (!editableProduct.title) {
      alert('Please enter a product title first');
      return;
    }

    setIsGeneratingImage(true);

    try {
      // Create text for AI image generation using title and description
      const imageText = editableProduct.description 
        ? `${editableProduct.title}, ${editableProduct.description}`
        : editableProduct.title;

      console.log('Generating image for text:', imageText);
      const generatedImageUrl = await generateImage(imageText);
      
      if (generatedImageUrl) {
        // Update the product with new AI-generated image URL
        const updatedProduct = {
          ...editableProduct,
          imageUrl: generatedImageUrl,
        };
        
        setEditableProduct(updatedProduct);
        setCurrentImageUrl(generatedImageUrl); // Update display immediately

        // Save the updated product to localStorage
        try {
          await updateProduct(updatedProduct);
          console.log('Product with AI-generated image saved to localStorage');
        } catch (error) {
          console.error('Error saving product to localStorage:', error);
        }

        // Call the onImageUpdate callback to update the main view immediately
        if (onImageUpdate) {
          onImageUpdate(updatedProduct);
        }

        console.log('AI image generated successfully');
      } else {
        alert('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

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
      const productId = editableProduct._id || 'temp_' + Date.now().toString();
      const imageUrl = await uploadImageToLocalStorage(file, productId);
      
      // Update the product with new image URL
      const updatedProduct = {
        ...editableProduct,
        imageUrl: imageUrl,
        _id: editableProduct._id || productId // Set ID if it was temporary
      };
      
      setEditableProduct(updatedProduct);
      setCurrentImageUrl(imageUrl); // Update display immediately

      // Save the updated product to localStorage
      try {
        await updateProduct(updatedProduct);
        console.log('Product with uploaded image saved to localStorage');
      } catch (error) {
        console.error('Error saving product to localStorage:', error);
      }

      // Call the onImageUpdate callback to update the main view immediately
      if (onImageUpdate) {
        onImageUpdate(updatedProduct);
      }

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
    // Reset to English when dialog opens or product changes
    setShowTranslated(false);
    
    if (product) {
      // Always check localStorage first for the most recent image
      let imageUrl = product.imageUrl || "";
      if (product._id) {
        const storedImage = getImageFromLocalStorage(product._id);
        if (storedImage) {
          imageUrl = storedImage;
        }
      }
      
      setEditableProduct({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        createdAt: product.createdAt || "",
        imageUrl: imageUrl,
        _id: product._id,
      });
      
      // Set current image URL for immediate display
      setCurrentImageUrl(imageUrl);
    }
  }, [product, open, product?.imageUrl, product?._id]); // Watch for any changes in product properties


  const handleChange = (field: keyof Product) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | null | undefined
  ) => {
    if (!field || !event?.target) return;
    const value = event.target.value;
//    console.log("Field changed:", field, ":", value);
    if (field === "title") {
      setEditableProduct((prev) => ({
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
          setEditableProduct((prev) => ({
            ...prev,
            [field]: 0,
          }))
          setPriceError("Price must be a valid number");
        } else {
          setEditableProduct((prev) => ({
            ...prev,
            [field]: value,
          }))
          setPriceError("");

        }
      } else if (field === "description") {
        setEditableProduct((prev) => ({
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

  const handleSave = async () => {
    try {
      // Save to localStorage first
      await updateProduct(editableProduct);
      console.log('Product saved to localStorage successfully');
      
      // Then call the parent onSave callback
      onSave(editableProduct);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      // Still call parent onSave even if localStorage fails
      onSave(editableProduct);
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
                '&:hover .ai-hint': {
                  opacity: 1,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {(isUploadingImage || isGeneratingImage) && (
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
                  {isGeneratingImage && (
                    <Box
                      position="absolute"
                      bottom={20}
                      color="white"
                      fontSize="0.875rem"
                      textAlign="center"
                    >
                      Generating AI image...
                    </Box>
                  )}
                </Box>
              )}
              
              {/* AI Generate icon overlay - top right */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateImage();
                }}
                disabled={isGeneratingImage || isUploadingImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 3,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'rgba(255,255,255,0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
                title="Generate AI image from title and description"
              >
                <SmartToyIcon sx={{ fontSize: '1.25rem' }} />
              </IconButton>
              
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
                  currentImageUrl ||
                  editableProduct.imageUrl ||
                  "https://placehold.co/300x200?text=Click+to+Upload+Image"
                }
                alt={editableProduct.title || "Product image"}
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
                left={8}
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
                Click to upload
              </Box>
              
              {/* AI hint */}
              <Box
                className="ai-hint"
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
                <SmartToyIcon sx={{ fontSize: '0.875rem' }} />
                AI generate
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
              value={editableProduct.title}
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
              value={editableProduct.description}
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
              value={editableProduct.price}
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
              value={editableProduct.createdAt ? new Date(editableProduct.createdAt).toLocaleString("en-GB") : "Not set"}
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
