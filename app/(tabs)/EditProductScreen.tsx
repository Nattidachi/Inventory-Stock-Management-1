import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

export default function EditProductScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [sizes, setSizes] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const BASE_URL = 'http://119.59.102.61:3000';

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      Alert.alert("Error", "Product ID not found. Please go back and try again.");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/products/${productId}`);
        const productData = response.data;
        setProduct(productData);
        setName(productData.name);
        setDescription(productData.description);
        setPrice(String(productData.price));
        setStock(String(productData.stock));
        setCategory(productData.category);
        setBrand(productData.brand);
        setLocation(productData.location);
        setSizes(productData.sizes);
        setImage(productData.image_url); // URL จาก server
      } catch (error) {
        console.error('Failed to fetch product:', error);
        Alert.alert("Error", "Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // เลือกรูปใหม่จาก Gallery
  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access media library is required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // ตั้ง URI ใหม่
    }
  };

  // อัปเดตสินค้า
  const handleUpdateProduct = async () => {
    if (!name || !price || !stock) {
      Alert.alert("Validation", "Name, Price, and Stock are required.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', category);
    formData.append('brand', brand);
    formData.append('location', location);
    formData.append('sizes', sizes);

    // แนบไฟล์เฉพาะกรณีเลือกภาพใหม่ (file://)
    if (image && image.startsWith('file://')) {
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      const mimeType = fileType === 'jpg' ? 'image/jpeg' : `image/${fileType}`;
      formData.append('image', {
        uri: image,
        name: `photo.${fileType}`,
        type: mimeType,
      });
    }

    try {
      await axios.put(`${BASE_URL}/api/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert("Success", "Product updated successfully.");

      // ดึงข้อมูลใหม่จาก server และเพิ่ม timestamp เพื่อตัด cache
      const response = await axios.get(`${BASE_URL}/api/products/${productId}`);
      const updatedProduct = response.data;
      setProduct(updatedProduct);
      setImage(`${updatedProduct.image_url}?t=${Date.now()}`);

    } catch (error) {
      console.error('Failed to update product:', error);
      Alert.alert("Error", "Failed to update product.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#442f20" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Product</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput style={styles.input} placeholder="Enter product name" value={name} onChangeText={setName} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.input} placeholder="Enter description" value={description} onChangeText={setDescription} multiline />

        <Text style={styles.label}>Price</Text>
        <TextInput style={styles.input} placeholder="Enter price" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <Text style={styles.label}>Stock</Text>
        <TextInput style={styles.input} placeholder="Enter stock quantity" value={stock} onChangeText={setStock} keyboardType="numeric" />

        <Text style={styles.label}>Category</Text>
        <TextInput style={styles.input} placeholder="Enter category" value={category} onChangeText={setCategory} />

        <Text style={styles.label}>Brand</Text>
        <TextInput style={styles.input} placeholder="Enter brand" value={brand} onChangeText={setBrand} />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} placeholder="Enter location" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Sizes (comma-separated)</Text>
        <TextInput style={styles.input} placeholder="e.g., S, M, L" value={sizes} onChangeText={setSizes} />

        <Text style={styles.label}>Product Image</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={handleChooseImage}>
          <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
          <Text style={styles.imagePickerText}>Choose Image</Text>
        </TouchableOpacity>

        {image && (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        )}

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProduct} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.updateButtonText}>Update Product</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' }, // เปลี่ยนเป็นโทนเดียวกับ AddProductScreen
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFC0CB', // เปลี่ยนเป็นสีชมพูเหมือน AddProductScreen
  },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 16, color: '#442f20' }, // สีสีน้ำตาลเข้ม
  formContainer: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#442f20', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF0F5',
    color: '#442f20',
    marginTop: 6,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imagePickerText: { marginLeft: 8, fontSize: 16, color: '#4b413aff' },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    resizeMode: 'contain',
  },
  updateButton: {
    backgroundColor: '#4b413aff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  updateButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  backButton: { padding: 8 },
});
