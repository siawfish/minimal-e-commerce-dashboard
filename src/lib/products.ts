import { collection, addDoc, Timestamp, getDocs, doc, getDoc, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product, CreateProductData } from '@/types/firebase';

/**
 * Upload image to Firebase Storage
 */
export async function uploadProductImage(file: File, productName: string): Promise<string> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `products/${fileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload multiple images to Firebase Storage
 */
export async function uploadProductImages(files: File[], productName: string): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadProductImage(file, productName));
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images');
  }
}

/**
 * Create a new product in Firestore
 */
export async function createProduct(productData: CreateProductData): Promise<string> {
  try {
    let imageUrls: string[] = [];

    // Upload images if provided
    if (productData.images && productData.images.length > 0) {
      imageUrls = await uploadProductImages(productData.images, productData.name);
    }

    // Prepare product data for Firestore
    const product: Omit<Product, 'id'> = {
      name: productData.name.trim(),
      price: parseFloat(productData.price),
      description: productData.description.trim(),
      category: productData.category,
      sizes: productData.sizes,
      images: imageUrls,
      quantity: parseInt(productData.quantity),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };

    // Add product to Firestore
    const docRef = await addDoc(collection(db, 'products'), product);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

/**
 * Validate product data
 */
export function validateProductData(data: CreateProductData): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('Product name is required');
  }

  if (!data.price || parseFloat(data.price) <= 0) {
    errors.push('Valid price is required');
  }

  if (!data.quantity || parseInt(data.quantity) < 0) {
    errors.push('Valid quantity is required');
  }

  if (!data.description.trim()) {
    errors.push('Product description is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (data.sizes.length === 0) {
    errors.push('At least one size must be selected');
  }

  // Validate images: check if we have either new images or existing images
  const hasNewImages = data.images && data.images.length > 0;
  const hasExistingImages = data.existingImages && data.existingImages.length > 0;
  
  if (!hasNewImages && !hasExistingImages) {
    errors.push('At least one image is required');
  }

  return errors;
}

/**
 * Fetch all products from Firestore
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data()
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef, 
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('Failed to fetch products by category');
  }
}

/**
 * Update an existing product in Firestore
 */
export async function updateProduct(productId: string, productData: CreateProductData): Promise<void> {
  try {
    let newImageUrls: string[] = [];
    
    // Upload new images if provided
    if (productData.images && productData.images.length > 0) {
      newImageUrls = await uploadProductImages(productData.images, productData.name);
    }

    // Combine existing images (not removed) with new images
    const existingImages = productData.existingImages || [];
    const removedImages = productData.removedImageUrls || [];
    const keepImages = existingImages.filter(url => !removedImages.includes(url));
    const finalImages = [...keepImages, ...newImageUrls];

    // Prepare update data
    const updateData: Partial<Omit<Product, 'id'>> = {
      name: productData.name.trim(),
      price: parseFloat(productData.price),
      description: productData.description.trim(),
      category: productData.category,
      sizes: productData.sizes,
      images: finalImages,
      quantity: parseInt(productData.quantity),
      updatedAt: Timestamp.now(),
    };

    // Update product in Firestore
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, updateData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
} 