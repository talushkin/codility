# My Store - Product Management App

A React TypeScript application for product management with CRUD operations, image upload/AI generation, and local storage persistence.

## Features

- ✅ Add, edit, delete, and view products
- ✅ Sort products by various criteria
- ✅ Upload product images or generate AI images
- ✅ Local storage persistence
- ✅ Responsive design (desktop/mobile)
- ✅ Dark/Light theme support
- ✅ Real-time search functionality
- ✅ Redux state management

## File Structure

```
src/
├── index.tsx                 # App entry point with routing
├── styles.css               # Global styles
├── sorts.json               # Sort options configuration
├── react-app-env.d.ts       # TypeScript declarations
│
├── pages/                   # Page components
│   ├── HomePage.tsx         # Main application page
│   ├── ProductDetail.tsx    # Product detail view page
│   ├── Hooks.tsx           # Custom hooks (placeholder)
│   └── Test.tsx            # Test components (placeholder)
│
├── components/              # Reusable UI components
│   ├── HeaderBar.tsx       # Navigation and search bar
│   ├── MainContent.tsx     # Main content area with product grid
│   ├── CaseCard.tsx        # Individual product card
│   ├── ProductDetails.tsx  # Product editing form (modal)
│   ├── ProductDialog.tsx   # Product dialog wrapper
│   ├── SortSelector.tsx    # Sort dropdown component
│   ├── FooterBar.tsx       # Footer with theme toggle
│   ├── ThemeModeButton.tsx # Dark/Light mode toggle
│   ├── generateAI.tsx      # AI image generation utility
│   ├── GlobalStyle.tsx     # Material-UI theme provider
│   └── themes.tsx          # Theme definitions
│
├── utils/                   # Utility functions
│   ├── types.tsx           # TypeScript type definitions
│   └── storage.tsx         # Local storage operations
│
├── store/                   # Redux state management
│   ├── store.ts            # Redux store configuration
│   └── dataSlice.ts        # Redux slice for data operations
│
├── data/                    # Static data
│   └── defaultData.json    # Default products data
│
└── assets/                  # Static assets
    ├── cardboard-texture.jpg
    ├── wood-texture.jpg
    ├── leaf-left.png
    └── leaf-right.png
```

## Components Description

### Core Components

#### `HomePage.tsx`
- **Purpose**: Main application container
- **Features**: Theme management, responsive layout, component orchestration
- **Props**: Products data, selected product/category state
- **Key Functions**: Theme toggling, state management coordination

#### `HeaderBar.tsx`
- **Purpose**: Navigation and search interface
- **Features**: Product search with autocomplete, logo display
- **Props**: Categories, selected product, search handlers
- **Key Functions**: Real-time search, product navigation

#### `MainContent.tsx`
- **Purpose**: Central content area with product management
- **Features**: Product grid, pagination, sorting, CRUD operations
- **Props**: Selected category/product, desktop mode, theme
- **Key Functions**: 
  - Product listing with pagination
  - Add/Edit/Delete operations
  - Real-time image updates via `handleImageUpdate`
  - Sort and filter functionality

#### `CaseCard.tsx`
- **Purpose**: Individual product display card
- **Features**: Product preview, delete action, image loading from localStorage
- **Props**: Product item, dark mode, delete handler
- **Key Functions**: Product card rendering, delete confirmation

#### `ProductDetails.tsx`
- **Purpose**: Product editing interface (modal)
- **Features**: Form validation, image upload/AI generation, real-time updates
- **Props**: Product data, save/close handlers, image update callback
- **Key Functions**:
  - Form validation (title, description, price)
  - Image upload with file validation
  - AI image generation from text
  - Real-time image display updates
  - localStorage integration

### Utility Components

#### `SortSelector.tsx`
- **Purpose**: Product sorting dropdown
- **Features**: Multiple sort criteria from `sorts.json`

#### `ThemeModeButton.tsx`
- **Purpose**: Dark/Light theme toggle
- **Features**: Theme switching with Material-UI icons

#### `ProductDialog.tsx`
- **Purpose**: Modal wrapper for product operations
- **Features**: Dialog management, form handling

## Main Application Flow

### 1. Application Initialization
```
index.tsx → App() → useEffect() → storage.loadData()
```
- Load data from localStorage or default data
- Initialize routing and Redux store
- Set up theme provider

### 2. Product Listing Flow
```
HomePage → MainContent → CaseCard (multiple)
```
- Display products in paginated grid
- Show product cards with images from localStorage
- Handle sorting and filtering

### 3. Product Creation/Editing Flow
```
MainContent → ProductDialog/ProductDetails → handleSave → Redux → localStorage
```
- Open modal form for editing
- Validate form inputs
- Handle image upload/AI generation
- Save to Redux store and localStorage
- Update UI in real-time

### 4. Image Management Flow
```
ProductDetails → handleImageUpload/handleGenerateImage → onImageUpdate → MainContent
```
- Upload image files or generate AI images
- Store images in localStorage as base64
- Trigger real-time UI updates via callbacks
- Update both dialog and main view immediately

### 5. Search Flow
```
HeaderBar → autocomplete → setSelectedProduct → MainContent
```
- Real-time search across all products
- Navigate to specific products
- Update main content view

## Redux State Management

### Store Structure (`store/dataSlice.ts`)

#### State Variables

```typescript
interface DataState {
  siteData: SiteData | null;           // Complete site data structure
  loading: boolean;                    // Global loading state
  error: string | null;                // Error messages
  selectedProduct: Product | null;     // Currently selected/viewed product
  selectedCategory: Category | null;   // Currently selected category
}
```

#### Key State Variables

##### `selectedProduct: Product | null`
- **Purpose**: Tracks the currently selected product for viewing/editing
- **Updated by**: 
  - `setSelectedProduct()` action
  - Product selection from search
  - Product card clicks
  - Navigation actions
- **Used by**: 
  - `MainContent` for displaying product details
  - `ProductDetails` for editing
  - `HeaderBar` for search results

##### `loading: boolean`
- **Purpose**: Manages global loading state during async operations
- **Updated by**:
  - `loadData.pending` - Start loading
  - `loadData.fulfilled` - Stop loading (success)
  - `loadData.rejected` - Stop loading (error)
  - CRUD operations (add/update/delete product)
- **Used by**:
  - App-wide loading indicators
  - Disable UI during operations
  - Loading spinners in components

##### `siteData: SiteData | null`
- **Purpose**: Complete application data including categories and products
- **Structure**:
  ```typescript
  interface SiteData {
    categories: Category[];
    // other site-wide data
  }
  
  interface Category {
    category: string;
    itemPage: Product[];
  }
  ```

#### Redux Async Thunks

##### `loadData`
- **Purpose**: Load initial data from localStorage or defaults
- **Flow**: `pending → fulfilled/rejected`
- **Updates**: `siteData`, `loading`, `error`

##### `addProductThunk`
- **Purpose**: Add new product to store and localStorage
- **Flow**: Validate → Add to Redux → Save to localStorage
- **Updates**: `siteData.categories[].itemPage`

##### `updateProductThunk`
- **Purpose**: Update existing product
- **Flow**: Find product → Update Redux → Save to localStorage
- **Updates**: `siteData.categories[].itemPage[]`

##### `delProductThunk`
- **Purpose**: Delete product from store and localStorage
- **Flow**: Remove from Redux → Update localStorage
- **Updates**: `siteData.categories[].itemPage`

### Local State Management

#### Component-Level State
- **`MainContent.tsx`**: 
  - `viewedItem` - Local copy of selected product for editing
  - `Products` - Local products array for operations
  - `currentPage`, `itemsPerPage` - Pagination state

#### Real-time Updates
- **Image Updates**: `onImageUpdate` callback system bypasses Redux for immediate UI updates
- **Form State**: Local state in `ProductDetails` with validation
- **Search State**: Local autocomplete state in `HeaderBar`

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI (MUI)
- **Styling**: CSS + Tailwind classes
- **Storage**: localStorage with base64 image encoding
- **AI Integration**: Axios for AI image generation
- **Build Tool**: Create React App
- **Type Safety**: TypeScript with strict mode

## AI Image Generation API

### Backend Endpoint

The application integrates with an external AI image generation service for creating product images from text descriptions.

#### **POST** `/api/ai/image`
- **Base URL**: `https://be-tan-theta.vercel.app`
- **Full Endpoint**: `https://be-tan-theta.vercel.app/api/ai/image`
- **Purpose**: Generate product images from text descriptions using AI

#### Request Configuration
```typescript
// Headers
{
  "Authorization": "Bearer 1234",
  "Content-Type": "application/json"
}

// Request Body
{
  "text": string  // Product title + description for image generation
}
```

#### Response Format
```typescript
{
  "s3Url"?: string,     // Primary image URL (S3 storage)
  "imageUrl"?: string   // Alternative image URL
}
```

#### Implementation Details
- **Location**: `src/components/generateAI.tsx`
- **Function**: `generateImage(text: string): Promise<string | null>`
- **Error Handling**: Returns `null` on failure, logs errors to console
- **Usage Flow**:
  1. User clicks AI generate button in `ProductDetails`
  2. Combines product title + description as prompt text
  3. Sends POST request to AI endpoint
  4. Returns image URL for immediate display and localStorage storage

#### Integration Points
- **ProductDetails.tsx**: `handleGenerateImage()` function
- **ProductDialog.tsx**: AI generation button and loading states
- **Storage**: Generated images stored in localStorage as base64
- **Real-time Updates**: Images appear immediately via `onImageUpdate` callback

#### Authentication
- **Bearer Token**: `1234` (placeholder/demo token)
- **Note**: In production, use proper authentication tokens and environment variables

#### Error Handling
```typescript
try {
  const response = await generateImage(imageText);
  if (response) {
    // Success: Update product with new image URL
    setCurrentImageUrl(response);
    onImageUpdate(updatedProduct);
  } else {
    // Failure: Show error message
    alert('Failed to generate image. Please try again.');
  }
} catch (error) {
  console.error('Error generating image:', error);
}
```

## Development Setup

```bash
npm install
npm start
```

The application runs on `http://localhost:3000` with hot reload enabled.
