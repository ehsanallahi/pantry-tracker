"use client";

import { useState, useEffect, useCallback } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography, IconButton, Card, CardContent, CardActions, InputAdornment } from "@mui/material";
import { Add, Edit, Delete, Close, Search } from "@mui/icons-material";
import { collection, query, getDocs, deleteDoc, setDoc, doc, getDoc } from "firebase/firestore";
import { styled } from "@mui/system";
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXcrZb8Hd2oztoyUWkgujq1T-t2RrKjSQ",
  authDomain: "pantry-tracker-1fa35.firebaseapp.com",
  projectId: "pantry-tracker-1fa35",
  storageBucket: "pantry-tracker-1fa35.appspot.com",
  messagingSenderId: "57830252707",
  appId: "1:57830252707:web:e430e413116933d9339f16",
  measurementId: "G-29BHGGZYX0"
};

const themeColor = "#4caf50";

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalBox = styled(Box)({
  width: 400,
  bgcolor: "white",
  border: `2px solid ${themeColor}`,
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
  borderRadius: "8px",
});

const ItemCard = styled(Card)({
  minWidth: 275,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
});

const ActionButton = styled(Button)(({ themeColor }) => ({
  color: "white",
  backgroundColor: themeColor,
  '&:hover': {
    backgroundColor: "#388e3c",
  }
}));

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [updateMode, setUpdateMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach(doc => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setPantry(pantryList);
    setFilteredPantry(pantryList);
  };

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }
    await updatePantry();
  };

  const updateItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    await setDoc(docRef, { quantity });
    await updatePantry();
  };

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    await deleteDoc(docRef);
    await updatePantry();
  };

  const filterPantry = useCallback((query) => {
    const filtered = pantry.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPantry(filtered);
  }, [pantry]);

  useEffect(() => {
    updatePantry();
  }, []);

  useEffect(() => {
    filterPantry(searchQuery);
  }, [searchQuery, pantry, filterPantry]);

  useEffect(() => {
    // Client-side Firebase Analytics initialization
    const initializeAnalytics = async () => {
      if (typeof window !== 'undefined') {
        const supported = await isSupported();
        if (supported) {
          const app = initializeApp(firebaseConfig);
          const analytics = getAnalytics(app);
          // Additional analytics code if needed
        }
      }
    };

    initializeAnalytics().catch((error) => {
      console.error("Firebase Analytics not supported or error during initialization:", error);
    });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName("");
    setItemQuantity(1);
    setUpdateMode(false);
    setCurrentItem(null);
  };

  const handleAddItem = () => {
    addItem(itemName, itemQuantity);
    handleClose();
  };

  const handleUpdateItem = () => {
    updateItem(currentItem, itemQuantity);
    handleClose();
  };

  const handleEdit = (name, quantity) => {
    setCurrentItem(name);
    setItemName(name);
    setItemQuantity(quantity);
    setUpdateMode(true);
    handleOpen();
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, p: 2, backgroundColor: "#f7f9fc" }}>
      <StyledModal open={open} onClose={handleClose}>
        <ModalBox>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" color={themeColor}>{updateMode ? "Update Item" : "Add Item"}</Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
          <TextField 
            fullWidth 
            value={itemName} 
            onChange={(e) => setItemName(e.target.value)} 
            placeholder="Item Name" 
            disabled={updateMode}
          />
          <TextField 
            fullWidth 
            type="number" 
            value={itemQuantity} 
            onChange={(e) => setItemQuantity(parseInt(e.target.value))} 
            placeholder="Quantity" 
          />
          <ActionButton 
            variant="contained"
            onClick={updateMode ? handleUpdateItem : handleAddItem}
            sx={{ mt: 2 }}
            themeColor={themeColor}
          >
            {updateMode ? "Update" : "Add"}
          </ActionButton>
        </ModalBox>
      </StyledModal>
      <ActionButton variant="contained" onClick={handleOpen} startIcon={<Add />} themeColor={themeColor}> Add New Item</ActionButton>
      <Box
        sx={{ width: "100%", maxWidth: 800, textAlign: "center", mb: 2 }}
      >
        <Typography variant="h4" color={themeColor}>Pantry Items</Typography>
      </Box>
      <TextField
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search items"
        sx={{ mb: 3, maxWidth: 800 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <Stack width="100%" maxWidth={800} spacing={2} sx={{ overflow: "auto" }}>
        {filteredPantry.map(({ name, quantity }) => (
          <ItemCard key={name}>
            <CardContent>
              <Typography variant="h5" component="div" color={themeColor}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quantity: {quantity}
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton color="primary" onClick={() => handleEdit(name, quantity)}>
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => deleteItem(name)}>
                <Delete />
              </IconButton>
            </CardActions>
          </ItemCard>
        ))}
      </Stack>
    </Box>
  );
}
