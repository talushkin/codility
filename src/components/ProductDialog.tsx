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
import type { Product } from "../utils/types";

const BASE_URL = "https://be-tan-theta.vercel.app";

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
  onDelete,
  Product,
  targetLang = "en",
  type,
  categoryName,
  autoFill = false,
}: ProductDialogProps) => {


  const [editableProduct, setEditableProduct] = useState<Product>({
    title: Product?.title || "",
    description: Product?.description || "",

    price: Product?.price || 10,
    createdAt: Product?.createdAt || "",
    imageUrl: Product?.imageUrl || "",
    _id: Product?._id,
  });
  const isRTL: Boolean = false; // Assuming you have a way to determine if the language is RTL

  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [showTranslated, setShowTranslated] = useState<boolean>(false);
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [descError, setDescError] = useState("");
 // console.log('editableProduct:', editableProduct);
  useEffect(() => {
    // Reset to English when dialog opens or Product changes
    setShowTranslated(false);
    setEditableProduct({
      title: Product?.title || "",
      description: Product?.description || "",

      price: Product?.price || 10,
      createdAt: Product?.createdAt || "",
      imageUrl: Product?.imageUrl || "",
      _id: Product?._id,
    });
  }, [Product, open]);

  useEffect(() => {
    if (Product) {
      setEditableProduct({
        title: Product.title || "",
        price: Product.price || 10,
        description: Product.description || "",
        imageUrl: Product.imageUrl || "",
        _id: Product._id,
      });
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

  const handleSave = () => {
    onSave(editableProduct);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      setEditableProduct((prev) => ({ ...prev, _id: Product?._id }));
      onDelete(editableProduct);
      onClose();
    }
  };

  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      dir={isRTL ? "rtl" : "ltr"}
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
          textAlign: "center",
          padding: "8px", // Reduced padding
          fontSize: "1.1rem", // Further reduced from 1.5rem
          fontWeight: "bold",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          position: "relative",
          minHeight: "40px", // Reduced from 60px
          flexShrink: 0, // Prevent shrinking
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
            <img
              src={
                editableProduct.imageUrl ||
                "https://placehold.co/100x100?text=No+Image"
              }
              alt={editableProduct.title}
              style={{ 
                width: "calc(100% - 10px)", // Full width minus 5px margins on each side
                maxWidth: "calc(100% - 10px)",
                height: "150px", // Fixed height instead of auto
                maxHeight: "150px", // Reduced from 300px to fit better
                borderRadius: "28px",
                margin: "5px", // 5px margin on all sides
                objectFit: "cover" // Cover to fill width while maintaining aspect ratio
              }}
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
          Add product
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
