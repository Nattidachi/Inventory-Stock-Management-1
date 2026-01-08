import React, { useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function AddProductScreen() {
  const router = useRouter();
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
  const [productCode, setProductCode] = useState('');
  const [orderName, setOrderName] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategory('');
    setBrand('');
    setLocation('');
    setSizes('');
    setImage(null);
    setProductCode('');
    setOrderName('');
  };

  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [])
  );

  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Permission to access media library is needed to upload an image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddProduct = async () => {
    if (!name || !price || !stock) {
      Alert.alert('Required fields', 'Please fill in Name, Price, and Stock.');
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
    formData.append('productCode', productCode);
    formData.append('orderName', orderName);

    if (image) {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', image, true);
        xhr.send(null);
      });

      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
      if (type.includes('jpg')) type = 'image/jpeg';
      formData.append('image', blob as any, filename);
    }

    try {
      const response = await fetch('http://119.59.102.61:3000/api/products', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add product.');
      Alert.alert('Success', 'Product has been added.');
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error.message);
      Alert.alert('Error', error.message || 'Failed to add product.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#442f20" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Product</Text>
      </View>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {[
          { label: 'Product Name *', value: name, set: setName, placeholder: 'Enter product name' },
          { label: 'Description', value: description, set: setDescription, placeholder: 'Enter description', multiline: true },
          { label: 'Price *', value: price, set: (text: string) => setPrice(text.replace(/[^0-9.]/g, '')), placeholder: 'Enter price', keyboardType: 'numeric' },
          { label: 'Stock *', value: stock, set: (text: string) => setStock(text.replace(/[^0-9]/g, '')), placeholder: 'Enter stock quantity', keyboardType: 'numeric' },
          { label: 'Category', value: category, set: setCategory, placeholder: 'Enter category' },
          { label: 'Brand', value: brand, set: setBrand, placeholder: 'Enter brand' },
          { label: 'Location', value: location, set: setLocation, placeholder: 'Enter location' },
          { label: 'Sizes', value: sizes, set: setSizes, placeholder: 'Enter Height (cm)' },
          { label: 'Product Code', value: productCode, set: setProductCode, placeholder: 'Enter product code (Optional)' },
          { label: 'Order Name', value: orderName, set: setOrderName, placeholder: 'Enter order name (Optional)' },
        ].map((field, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={field.value}
              onChangeText={field.set}
              placeholder={field.placeholder}
              placeholderTextColor="#888"
              multiline={field.multiline || false}
              keyboardType={field.keyboardType || 'default'}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.imagePickerButton} onPress={handleChooseImage}>
          <Ionicons name="image" size={20} color="#001F3F" />
          <Text style={styles.imagePickerButtonText}>Choose Image</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.previewImage} />}

        <TouchableOpacity style={styles.button} onPress={handleAddProduct} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Add Product</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' }, // โทนเดียวกับ index
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFC0CB', // โทนเดียวกับ index
  },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 16, color: '#442f20' },
  formContainer: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#442f20', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF0F5',
    color: '#442f20',
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
  imagePickerButtonText: { marginLeft: 8, fontSize: 16, color: '#4b413aff' },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  button: { backgroundColor: '#4b413aff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
