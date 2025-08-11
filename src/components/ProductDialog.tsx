// External modules
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
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";

// Types
import type { Product } from "../utils/types";

// Utils
import { updateProduct, uploadImageToLocalStorage, validateImageFile, getImageFromLocalStorage, storeAIImageToLocalStorage } from "../utils/storage";

// Components
import { generateImage } from "./generateAI";

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (Product: Product) => void;
  onDelete?: (Product: Product) => void;
  Product: Product;
  targetLang?: string;
  type?: string;
  categoryName?: string;
  autoFill?: boolean;
}

const ProductDialog = ({
  open,
  onClose,
  onSave,
  //onDelete,
  Product,
  type,
}: ProductDialogProps) => {


  const [editableProduct, setEditableProduct] = useState<Product>({
    title: Product?.title || "",
    description: Product?.description || "",

    price: Product?.price || 10,
    createdAt: Product?.createdAt || "",
    imageUrl: Product?.imageUrl || "",
    _id: Product?._id,
  });
  const [, setShowTranslated] = useState<boolean>(false);   
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [descError, setDescError] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const fileInputRef = React.createRef<HTMLInputElement>();  // Handle AI image generation
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
        // Store AI-generated image in localStorage
        const productId = editableProduct._id || 'temp_' + Date.now().toString();
        
        try {
          await storeAIImageToLocalStorage(generatedImageUrl, productId);
          console.log('AI-generated image stored in localStorage');
        } catch (error) {
          console.error('Error storing AI image to localStorage:', error);
        }

        // Update the product with new AI-generated image URL
        const updatedProduct = {
          ...editableProduct,
          imageUrl: generatedImageUrl,
          _id: editableProduct._id || productId // Set ID if it was temporary
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

 // console.log('editableProduct:', editableProduct);
  useEffect(() => {
    // Reset to English when dialog opens or Product changes
    setShowTranslated(false);
    
    if (Product) {
      // Always check localStorage first for the most recent image
      let imageUrl = Product.imageUrl || "";
      if (Product._id) {
        const storedImage = getImageFromLocalStorage(Product._id);
        if (storedImage) {
          imageUrl = storedImage;
        }
      }
      
      setEditableProduct({
        title: Product?.title || "",
        description: Product?.description || "",
        price: Product?.price || 10,
        createdAt: Product?.createdAt || "",
        imageUrl: imageUrl,
        _id: Product?._id,
      });
      
      // Set current image URL for immediate display
      setCurrentImageUrl(imageUrl);
    }
  }, [Product, open]);

  useEffect(() => {
    if (Product) {
      // Always check localStorage first for the most recent image
      let imageUrl = Product.imageUrl || "";
      if (Product._id) {
        const storedImage = getImageFromLocalStorage(Product._id);
        if (storedImage) {
          imageUrl = storedImage;
        }
      }
      
      setEditableProduct({
        title: Product.title || "",
        price: Product.price || 10,
        description: Product.description || "",
        imageUrl: imageUrl,
        _id: Product._id,
      });
      
      // Set current image URL for immediate display
      setCurrentImageUrl(imageUrl);
    }
  }, [Product]);


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
    <Dialog
      open={open || false}
      onClose={onClose}
      dir={"ltr"}
      maxWidth={false}
      fullWidth={false}
      PaperProps={{
        style: {
          maxWidth: "98vw",
          width: "98vw",
          maxHeight: "98vh",
          height: "98vh",
          margin: "1vw",
          borderRadius: "14px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          background: "rgb(247, 241, 227)",
          overflow: "hidden", // Remove scrolling
          display: "flex",
          flexDirection: "column",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            maxWidth: "98vw !important",
            width: "98vw !important",
            margin: "1vw !important",
          },
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
          textAlign: "left",
          padding: "20px", // Reduced padding
          fontSize: "1.1rem", // Further reduced from 1.5rem
          fontWeight: "bold",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          position: "relative",
          minHeight: "40px", // Reduced from 60px
          maxHeight: "80px", // Allow for 2 lines
          flexShrink: 0, // Prevent shrinking
          //padding: "20px", // Make room for close button
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: "1.3",
        }}
      >
        {editableProduct.title}
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
            padding: "8px", // Reduced padding
            flex: 1, // Take remaining space
            overflow: "hidden", // No scrolling
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            position="relative"
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginBottom={1} // Reduced
            style={{ minHeight: "90%", maxWidth: "100%" }} // Reduced height and prevent shrinking
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Loading overlay for AI generation or upload */}
            {(isGeneratingImage || isUploadingImage) && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bgcolor="rgba(0,0,0,0.7)"
                zIndex={2}
                borderRadius="28px"
                color="white"
              >
                <CircularProgress color="inherit" size={40} />
                <Box mt={1} fontSize="0.875rem">
                  {isGeneratingImage ? 'Generating AI image...' : 'Uploading image...'}
                </Box>
              </Box>
            )}
            
            {/* AI Generate icon overlay - top right */}
            <IconButton
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || isUploadingImage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 3,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                width: 32,
                height: 32,
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
              <SmartToyIcon sx={{ fontSize: '1rem' }} />
            </IconButton>

            {/* Camera icon overlay for upload */}
            <Box
              className="camera-icon"
              position="absolute"
              top="50%"
              left="50%"
              onClick={handleImageClick}
              sx={{
                transform: 'translate(-50%, -50%)',
                opacity: 0.7,
                transition: 'all 0.3s ease',
                zIndex: 1,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 1,
                  transform: 'translate(-50%, -50%) scale(1.1)',
                },
              }}
            >
              <CameraAltIcon 
                sx={{ 
                  fontSize: '1.5rem', 
                  color: 'white',
                }} 
              />
            </Box>
            
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
                  transform: 'translate(-50%, -50%) scale(1.1)',
                },
                '&:hover .upload-hint': {
                  opacity: 1,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <img
                src={
                  currentImageUrl ||
                  editableProduct.imageUrl ||
                  "https://placehold.co/100x100?text=Click+to+Upload"
                }
                alt={editableProduct.title}
                style={{ 
                  width: "300px", // Full width minus 5px margins on each side
                  maxWidth: "calc(100% - 10px)",
                  height: "300px", // Fixed height instead of auto
                  maxHeight: "300px", // Reduced from 300px to fit better
                  borderRadius: "28px",
                  margin: "5px", // 5px margin on all sides
                  objectFit: "cover" // Cover to fill width while maintaining aspect ratio
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
              label="New Product Name"
              placeholder="Enter product name"
              value={editableProduct.title}
              onChange={handleChange("title")}
              fullWidth
              margin="dense" // Changed to dense for tighter spacing
              InputProps={{
                style: {
                  fontSize: "1.2rem", // Reduced from 2rem
                  fontWeight: "bold",
                },

              }}
              InputLabelProps={{
                style: {
                  fontSize: "0.9rem", // Reduced from 1.2rem
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
              rows={2} // Reduced from 3
              margin="dense" // Changed to dense

            />

          </Box>

          <Box position="relative">
            <TextField
              error={!!priceError}
              helperText={priceError}
              label={"Price in $"}
              value={editableProduct.price}
              onChange={handleChange("price")}
              fullWidth
              rows={1}
              margin="dense" // Changed to dense
            />
          </Box>
        </DialogContent>
      </Box>

      <DialogActions
        sx={{
          display: "flex",
          gap: 1, // Reduced gap
          width: "100%",
          justifyContent: "center",
          background: "rgb(247, 241, 227)", // Set background color for actions area
          padding: "8px", // Reduced padding
          flexShrink: 0, // Prevent shrinking
          "& > button": {
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            paddingLeft: 1, // Reduced padding
            paddingRight: 1, // Reduced padding
            height: "40px", // Reduced from 48px
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
          disabled={!editableProduct.title || !editableProduct.price || !!nameError || !!priceError || !!descError}>
          {type === 'add' ? 'Add' : 'Update'} product
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
