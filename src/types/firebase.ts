import { Timestamp } from 'firebase/firestore';

export interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  sizes: string[];
  images: string[];
  quantity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface CreateProductData {
  name: string;
  price: string;
  description: string;
  category: string;
  sizes: string[];
  images?: File[];
  existingImages?: string[];
  removedImageUrls?: string[];
  quantity: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ProductSize {
  id: string;
  value: string;
  category: 'footwear' | 'apparel';
  isActive: boolean;
} 