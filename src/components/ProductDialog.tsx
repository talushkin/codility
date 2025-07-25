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
                editableProduct.imageUrl ||
                "https://placehold.co/100x100?text=No+Image"
              }
              alt={editableProduct.title}
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
