import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;
  const CARD_WIDTH = (width - 16 * (numColumns + 1)) / numColumns;

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const router = useRouter();
  const BASE_URL = 'http://119.59.102.61:3000';

  const categories = ['All', 'Electronics', 'Accessories', 'Household', 'Clearance'];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/products/search`, {
        params: { name: searchQuery },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, BASE_URL]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    fetchProducts();
  }, [fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const handleAddProduct = () => router.push('/AddProductScreen');

  const handleEditProduct = (productId) =>
    router.push({ pathname: '/EditProductScreen', params: { productId } });

  // --- แก้ไขปุ่ม Delete ใช้งานได้บนเว็บ ---
  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    const previousProducts = products;
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      await axios.delete(`${BASE_URL}/api/products/${productId}`);
      alert('Product deleted successfully.');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product.');
      setProducts(previousProducts);
    }
  };

  const filteredProducts = products
    .filter((p) => (activeCategory === 'All' ? true : (p.category || '') === activeCategory))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      const da = new Date(a.createdAt || a.id || Date.now());
      const db = new Date(b.createdAt || b.id || Date.now());
      return db - da;
    });

  const renderCard = ({ item }) => (
    <View style={[styles.card, { width: CARD_WIDTH }]}>
      <Image
        source={{ uri: item.image_url }}
        style={[styles.cardImage, { height: CARD_WIDTH * 0.75 }]}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text numberOfLines={2} style={styles.cardName}>
          {item.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.cardMeta}>Stock: {item.stock}</Text>
          <Text style={styles.cardPrice}>${item.price}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconSmall} onPress={() => handleEditProduct(item.id)}>
          <Ionicons name="create-outline" size={18} color="#FF69B4" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconSmall} onPress={() => handleDeleteProduct(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#FFD700" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brandColumn}>
          <Text style={styles.brandTitle}>Inventory</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#FF69B4" />
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={18} color="#FF69B4" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sortRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() =>
              setSortBy(sortBy === 'latest' ? 'price_asc' : sortBy === 'price_asc' ? 'price_desc' : 'latest')
            }
          >
            <Text style={styles.sortText}>
              {sortBy === 'latest' ? 'Latest' : sortBy === 'price_asc' ? 'Price ▲' : 'Price ▼'}
            </Text>
            <Ionicons name="funnel-outline" size={16} color="#442f20" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={filteredProducts}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={renderCard}
          numColumns={numColumns}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={handleAddProduct}>
                <Text style={styles.emptyAddText}>Add your first product</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', paddingTop: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  brandColumn: { flexDirection: 'column' },
  brandTitle: { fontSize: 22, fontWeight: '700', color: '#442f20' },
  searchSection: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F5', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#442f20', fontSize: 15 },
  sortRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'transparent', marginRight: 8 },
  categoryPillActive: { backgroundColor: '#FF69B4' },
  categoryText: { color: '#442f20', fontSize: 13 },
  categoryTextActive: { color: '#fff' },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#FFF0F5' },
  sortText: { marginRight: 6, color: '#442f20', fontSize: 13 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 90, paddingTop: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 14, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardImage: { width: '100%' },
  cardContent: { padding: 10 },
  cardName: { fontWeight: '700', fontSize: 14, color: '#442f20' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  cardMeta: { fontSize: 12, color: '#666' },
  cardPrice: { fontSize: 14, fontWeight: '700', color: '#FF1493' },
  cardActions: { position: 'absolute', right: 8, top: 8, flexDirection: 'column' },
    iconSmall: {
    backgroundColor: '#FFF0F5',
    padding: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#FF69B4' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#442f20', fontSize: 16, marginBottom: 12 },
  emptyAddButton: { backgroundColor: '#FF69B4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  emptyAddText: { color: '#fff', fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF69B4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});

