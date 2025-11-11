# E-commerce Platform API
RESTful API for an e-commerce platform

## Features
* JWT Authentication
* Manage products with admin role
* Stripe integration for payments

## Endpoints
| Method | Path | Description |
| - | - | - |
| POST | /auth/register | Register |
| POST | /auth/login | Login |
| POST | /products | Create product (admin only) |
| GET | /products | Get all products |
| GET | /products/:id | Get a product |
| PUT | /products/:id | Update a product |
| DELETE | /products/:id | Delete a product |
| POST | /cart/items | Add product to cart |
| GET | /cart | Get all cart items |
| PUT | /cart/items/:id | Update a cart item |
| DELETE | /cart/items/:id | Delete a cart item |
| POST | /orders | Create an order |
| GET | /orders | Get all orders |
| GET | /orders/:id | Get an order |
| PUT | /orders/:id | Update an order |
| DELETE | /orders/:id | Delete an order |
| POST | /orders/:id/pay | Submit and pay an order |

