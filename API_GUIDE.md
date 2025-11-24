# API Guide

This document provides complete documentation for the Configurator API endpoints.

## Base URL

All API endpoints are prefixed with `/api`

---

## Endpoints

### 1. Get Categories

Retrieve all available categories.

**Endpoint:** `GET /api/categories`

**Request Parameters:** None

**Response:** Array of category objects

**Example Request:**

```bash
curl -X GET http://localhost:3333/api/categories
```

**Example Response:**

```json
[
  {
    "id": 1,
    "name": "Laptops",
    "slug": "laptops",
    "description": "High-performance laptops",
    "image": "/uploads/categories/laptops.jpg",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Smartphones",
    "slug": "smartphones",
    "description": "Latest smartphones",
    "image": "/uploads/categories/smartphones.jpg",
    "created_at": "2024-01-15T10:35:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z"
  }
]
```

---

### 2. Get Products by Category

Retrieve products for a specific category with pagination support.

**Endpoint:** `GET /api/products/:categoryId`

**URL Parameters:**

- `categoryId` (required): The ID of the category

**Query Parameters:**

- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Items per page (default: 15, minimum: 1, maximum: 100)

**Example Request:**

```bash
curl -X GET "http://localhost:3333/api/products/1?page=1&limit=15"
```

**Example Response:**

```json
{
  "category": {
    "id": 1,
    "name": "Laptops",
    "slug": "laptops",
    "description": "High-performance laptops",
    "image": "/uploads/categories/laptops.jpg",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "products": {
    "data": [
      {
        "id": 1,
        "name": "MacBook Pro 16",
        "slug": "macbook-pro-16",
        "sku": "LAPTOP-MACBP-1",
        "price": 2499.99,
        "description": "Powerful laptop for professionals",
        "image": "/uploads/products/macbook-pro.jpg",
        "category": {
          "id": 1,
          "name": "Laptops"
        },
        "options": [
          {
            "id": 1,
            "name": "Processor",
            "values": [
              {
                "id": 1,
                "name": "M3 Pro",
                "price_adder": 0
              },
              {
                "id": 2,
                "name": "M3 Max",
                "price_adder": 500
              }
            ]
          },
          {
            "id": 2,
            "name": "Memory",
            "values": [
              {
                "id": 3,
                "name": "16GB",
                "price_adder": 0
              },
              {
                "id": 4,
                "name": "32GB",
                "price_adder": 200
              }
            ]
          }
        ]
      }
    ],
    "meta": {
      "total": 10,
      "per_page": 15,
      "current_page": 1,
      "last_page": 1,
      "first_page": 1,
      "first_page_url": "/?page=1",
      "last_page_url": "/?page=1",
      "next_page_url": null,
      "previous_page_url": null
    }
  }
}
```

**Error Responses:**

**404 - Category Not Found:**

```json
{
  "message": "Category not found"
}
```

---

### 3. Configure Product

Generate a product variant SKU and calculate total price based on selected option values.

**Endpoint:** `GET /api/configure`

**Request Body:**

```json
{
  "product_id": 1,
  "option_value_ids": [2, 4]
}
```

**Request Parameters:**

- `product_id` (required, number): The ID of the product to configure. Must exist in the products table.
- `option_value_ids` (optional, array of numbers): Array of option value IDs to apply to the product. If not provided, returns base product configuration.

**Validation Rules:**

- `product_id`: Must be a number and must exist in the `products` table
- `option_value_ids`: Must be an array of numbers (optional)

**Business Rules:**

1. Product must have a base SKU
2. All option value IDs must be valid for the product
3. Cannot select multiple values from the same option
4. Option values are sorted by option creation date
5. Total price = base price + sum of all selected option value price adders
6. Variant SKU is generated from base SKU + option value codes

**Example Request:**

```bash
curl -X GET "http://localhost:3333/api/configure" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "option_value_ids": [2, 4]
  }'
```

**Example Response (Success):**

```json
{
  "sku": "LAPTOP-MACBP-1-M3-MAX-32GB",
  "total_price": 3199.99,
  "base_price": 2499.99,
  "configuration": {
    "product": {
      "id": 1,
      "name": "MacBook Pro 16",
      "slug": "macbook-pro-16",
      "base_sku": "LAPTOP-MACBP-1"
    },
    "selected_options": [
      {
        "option_id": 1,
        "option_name": "Processor",
        "option_created_at": "2024-01-15T10:00:00.000Z",
        "value_id": 2,
        "value_name": "M3 Max",
        "price_adder": 500,
        "sku": "M3-MAX"
      },
      {
        "option_id": 2,
        "option_name": "Memory",
        "option_created_at": "2024-01-15T10:05:00.000Z",
        "value_id": 4,
        "value_name": "32GB",
        "price_adder": 200,
        "sku": "32GB"
      }
    ]
  }
}
```

**Example Request (No Options):**

```bash
curl -X GET "http://localhost:3333/api/configure" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1
  }'
```

**Example Response (No Options):**

```json
{
  "sku": "LAPTOP-MACBP-1",
  "total_price": 2499.99,
  "base_price": 2499.99,
  "configuration": {
    "product": {
      "id": 1,
      "name": "MacBook Pro 16",
      "slug": "macbook-pro-16",
      "base_sku": "LAPTOP-MACBP-1"
    },
    "selected_options": []
  }
}
```

**Error Responses:**

**400 - Product Missing Base SKU:**

```json
{
  "message": "Product does not have a base SKU"
}
```

**400 - Invalid Option Values:**

```json
{
  "message": "Some selected option values are not valid for this product",
  "invalid_option_value_ids": [99, 100]
}
```

**400 - Duplicate Options:**

```json
{
  "message": "Cannot select multiple values from the same option",
  "duplicate_option_ids": [1]
}
```

**404 - Product Not Found:**

```json
{
  "message": "Product not found"
}
```

---

## SKU Generation Logic

### Base SKU Format

Base SKU follows the pattern: `{CATEGORY_CODE}-{PRODUCT_CODE}-{PRODUCT_ID}`

Example: `LAPTOP-MACBP-1`

- `LAPTOP`: Category code (first 6 characters of category name)
- `MACBP`: Product code (first 6 characters of product name)
- `1`: Product ID

### Option Value SKU Format

Option value SKU is generated from the value name:

- Converted to uppercase
- Special characters removed
- Spaces and hyphens normalized
- Truncated to 8 characters

Example: `M3 Max` → `M3-MAX`

### Variant SKU Format

Variant SKU combines base SKU with option value codes:
`{BASE_SKU}-{VALUE_CODE_1}-{VALUE_CODE_2}-...`

Example: `LAPTOP-MACBP-1-M3-MAX-32GB`

**Note:** Option values are sorted by their option's creation date before SKU generation to ensure consistent ordering.

---
