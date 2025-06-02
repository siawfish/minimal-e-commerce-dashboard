# E-commerce Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) for managing an e-commerce platform.

## Features

- 🏪 **Product Management**: Add, edit, and manage products with images
- 🔥 **Firebase Integration**: Real-time database and cloud storage
- 📱 **Responsive Design**: Mobile-first responsive UI
- 🖼️ **Image Upload**: Drag & drop image upload to Firebase Storage
- 📊 **Dashboard Analytics**: Overview of products, orders, and customers
- 🔐 **Authentication**: Firebase Auth integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Firebase project setup

### Installation

1. Clone the repository and navigate to the dashboard:
```bash
cd dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication, Firestore, and Storage

### 2. Configure Firestore Database
Create the following collections:
- `products` - Store product information
- `categories` - Product categories
- `orders` - Customer orders
- `users` - User profiles

### 3. Configure Firebase Storage
1. Enable Firebase Storage
2. Set up security rules for image uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{imageId} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 4. Configure Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Project Structure

```
dashboard/
├── src/
│   ├── app/                 # Next.js app directory
│   │   └── (authenticated)/ # Protected routes
│   │       └── product/ # Product creation page
│   ├── components/          # Reusable UI components
│   │   └── ui/             # Base UI components
│   ├── lib/                # Utility functions
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── products.ts     # Product-related functions
│   └── types/              # TypeScript type definitions
│       └── firebase.ts     # Firebase type definitions
```

## API Reference

### Product Management

#### `createProduct(productData: CreateProductData): Promise<string>`
Creates a new product in Firestore with optional image upload to Storage.

#### `uploadProductImage(file: File, productName: string): Promise<string>`
Uploads product image to Firebase Storage and returns download URL.

#### `validateProductData(data: CreateProductData): string[]`
Validates product data and returns array of validation errors.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Firebase Documentation](https://firebase.google.com/docs) - learn about Firebase services.
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Make sure to add your environment variables in the Vercel dashboard before deploying.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
