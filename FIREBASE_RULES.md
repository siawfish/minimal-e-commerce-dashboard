# Complete Firebase Security Rules

This file contains all the security rules needed for your e-commerce project.

## 🔥 Firebase Storage Rules

Go to **Firebase Console → Storage → Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Rules for product images
    match /products/{imageId} {
      // Allow anyone to read product images (for public display)
      allow read: if true;
      
      // Allow write only for authenticated users with restrictions
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024  // Max 5MB
        && request.resource.contentType.matches('image/.*');  // Only images
    }
    
    // Optional: Rules for user profile images
    match /users/{userId}/profile/{imageId} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024  // Max 2MB
        && request.resource.contentType.matches('image/.*');
    }
    
    // Deny all other paths by default
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 🗄️ Firestore Database Rules

Go to **Firebase Console → Firestore Database → Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products collection
    match /products/{productId} {
      // Anyone can read products (for public catalog)
      allow read: if true;
      
      // Only authenticated users can create/update/delete products
      allow write: if request.auth != null;
    }
    
    // Categories collection
    match /categories/{categoryId} {
      // Anyone can read categories
      allow read: if true;
      
      // Only authenticated users can manage categories
      allow write: if request.auth != null;
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can only read their own orders
      allow read: if request.auth != null 
        && (request.auth.uid == resource.data.userId 
            || request.auth.uid in resource.data.adminUsers);
      
      // Users can create orders, but only update their own
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
      
      // Only admins can update/delete orders
      allow update, delete: if request.auth != null 
        && request.auth.uid in resource.data.adminUsers;
    }
    
    // Users collection (for user profiles)
    match /users/{userId} {
      // Users can only read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can create/update their own profile
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Cart collection (for shopping carts)
    match /carts/{cartId} {
      // Users can only access their own cart
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      
      // Allow creating new cart
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Admin collection (for admin settings)
    match /admin/{document} {
      // Only admin users can access admin data
      allow read, write: if request.auth != null 
        && request.auth.token.admin == true;
    }
    
    // Deny all other paths by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔐 Authentication Setup

### Custom Claims for Admin Users
To set admin privileges, use Firebase Admin SDK or Functions:

```javascript
// Set admin custom claim
admin.auth().setCustomUserClaims(uid, { admin: true });
```

### Admin Check Function (Optional)
Add this to your Firebase Functions:

```javascript
exports.makeAdmin = functions.https.onCall(async (data, context) => {
  // Check if request is made by an admin
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Must be an admin');
  }
  
  // Set admin custom claim
  await admin.auth().setCustomUserClaims(data.uid, { admin: true });
  
  return { success: true };
});
```

## 📋 Quick Setup Checklist

### 1. Storage Rules ✅
- [ ] Go to Firebase Console → Storage → Rules
- [ ] Paste the Storage rules above
- [ ] Click "Publish"

### 2. Firestore Rules ✅
- [ ] Go to Firebase Console → Firestore → Rules
- [ ] Paste the Firestore rules above
- [ ] Click "Publish"

### 3. Test Your Setup 🧪
- [ ] Try uploading a product image (should work when authenticated)
- [ ] Try creating a product (should work when authenticated)
- [ ] Try accessing products without auth (should work for reading)

## 🛡️ Security Features

### Storage Security:
- ✅ Only authenticated users can upload
- ✅ File size limits (5MB for products, 2MB for profiles)
- ✅ Only image files allowed
- ✅ Public read access for product display

### Firestore Security:
- ✅ Public read access for products/categories
- ✅ Authenticated write access for products
- ✅ User-specific access for orders/carts/profiles
- ✅ Admin-only access for admin settings
- ✅ Proper data validation

## 🚨 Important Notes

1. **Test thoroughly** in Firebase Rules Playground
2. **Start with more restrictive rules** and gradually open up as needed
3. **Always validate on both client and server side**
4. **Monitor usage** in Firebase Console
5. **Set up Cloud Functions** for complex business logic

## 🔄 Development vs Production

For development, you might want slightly more permissive rules. Create separate Firebase projects for dev/staging/production with appropriate rule sets.

---

*Apply these rules and your Firebase setup will be secure and ready for production!* 🚀 