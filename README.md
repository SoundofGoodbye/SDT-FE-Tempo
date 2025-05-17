# SimpleDeliveryTracker (SDT) Frontend

## Project Overview

SimpleDeliveryTracker (SDT) is a web application designed to help companies manage and track product deliveries to various shops. The application allows users to monitor delivery schedules, manage product lists, and track the delivery process through different stages.

## Technology Stack

- **Frontend Framework**: Next.js with App Router
- **Language**: TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **API Communication**: Fetch API with custom client wrapper

## Main Features

### Authentication
- Simple login system with company selection
- Token-based authentication stored in localStorage

### Dashboard
The main dashboard provides an overview of deliveries with three main tabs:
1. **Dashboard** - Shows current deliveries for selected date
2. **Delivery History** - Displays a history of all deliveries
3. **Calendar** - Provides a calendar view of scheduled deliveries

### Delivery Management
- View deliveries for specific dates
- See delivery status for each shop
- Manage product lists for each delivery

### Product List Management
- View and edit product lists for deliveries
- Compare initial and current versions of product lists
- Track changes through different delivery stages:
  - INITIAL_REQUEST
  - ON_BOARDING
  - OFF_LOADING
  - FINAL

### Delivery History
- View history of all deliveries
- See version counts and last step for each delivery
- Compare different versions of deliveries

## API Endpoints

The application communicates with a backend API running at `http://localhost:8080`. Below are the main API endpoints used:

### Shop Management
- `GET company/{companyId}/shop/` - Get all shops for a company

### Product List Management
- `GET company/{companyId}/productList/calendar?month={month}` - Get dates with deliveries for a specific month
- `GET company/{companyId}/productList/latest/?shopId={shopId}&date={date}` - Get latest product list for a shop on a specific date
- `GET company/{companyId}/productList?shopId={shopId}&date={date}` - Get all versions of a product list
- `GET company/{companyId}/productListItems/{detailsId}/` - Get items in a product list
- `POST company/{companyId}/productList/{detailsId}/onboard` - Update product list during onboarding
- `PUT company/{companyId}/productList/{detailsId}/productItems` - Add a product to a product list
- `DELETE company/{companyId}/productList/{detailsId}/productItems/{productId}` - Remove a product from a product list

### Delivery History
- `GET company/{companyId}/productList/history` - Get delivery history for a company

## Application Structure

The application follows a standard Next.js App Router structure:

- `src/app` - Next.js pages and routes
  - `dashboard` - Dashboard page
  - `shops` - Shop-specific pages
- `src/components` - React components
  - `DeliveryDashboard.tsx` - Main dashboard component
  - `ProductListDetails.tsx` - Product list management
  - `DeliveryHistory.tsx` - Delivery history component
- `src/lib` - Utility functions and shared code
  - `api-client.ts` - API client for backend communication

## Getting Started

1. Ensure the backend API is running at `http://localhost:8080`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Notes

- The application uses a simple authentication system with a hardcoded demo token
- API responses follow a standard format with `message`, optional `count`, and `payload` fields
- The delivery process follows a specific workflow from INITIAL_REQUEST through to FINAL