# creole-website
# Creole Jamaican Artistry Web Application

## Project Overview

This project is a web-based e-commerce application for a Jamaican brand called *Creole Jamaican Artistry*, which sells handmade local products. The system allows users to register, log in, browse products, add items to a cart, checkout, generate invoices, and view analytics on a dashboard.

---

## Group Members and Responsibilities

* **Kristina Daley** – Authentication and Security

  * Registration and Login system
  * Form validation
  * TRN validation
  * Account lockout

* **Niketa Maschette** – Products and Cart

  * Product catalogue
  * Add to cart functionality
  * Quantity handling
  * Subtotal, tax, and discount calculations

* **Lee** – Checkout and Invoice

  * Checkout page
  * Shipping details
  * Invoice generation
  * Storing invoices in localStorage

* **Trevon Fullwood** – Dashboard, Testing and Integration

  * Dashboard page
  * Frequency (Gender and Age)
  * Display invoices
  * Search invoices by TRN
  * Testing the full system
  * Linking all pages

---

## Features

* User Registration and Login with validation
* Product listing and shopping cart system
* Automatic calculation of:

  * Subtotal
  * Discount (5%)
  * Tax (15% GCT)
  * Total cost
* Checkout system with invoice generation
* Data storage using localStorage
* Dashboard with:

  * Gender frequency
  * Age group frequency
  * Invoice display
  * TRN-based search

---

## Technologies Used

* HTML
* CSS
* JavaScript
* Browser Local Storage

---

## How to Test the System

1. Register a new user
2. Login using TRN and password
3. Add products to cart
4. View cart and proceed to checkout
5. Enter shipping details and confirm order
6. View generated invoice
7. Go to dashboard:

   * View invoices
   * Search by TRN
   * View frequency statistics

---

## Page Navigation

* index.html – Home
* registration.html – Register
* login.html – Login
* products.html – Product catalogue
* cart.html – Shopping cart
* checkout.html – Checkout
* invoice.html – Invoice
* dashboard.html – Dashboard

---

## Dashboard Explanation

The dashboard displays stored data from localStorage:

* Gender frequency of registered users
* Age group distribution
* List of all invoices
* Search functionality using TRN

---

## Notes

* Data is stored locally in the browser using localStorage
* Clearing browser storage will reset the system
* The system is designed for demonstration and academic purposes

---

## Conclusion

This project demonstrates a complete front-end e-commerce workflow including user management, transactions, data storage, and analytics.
