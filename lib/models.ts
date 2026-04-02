/**
 * Central model registry. Import named models from here in all API routes.
 * This ensures every schema is registered before any .populate() call.
 */
export { default as User } from '@/models/User'
export { default as Vendor } from '@/models/Vendor'
export { default as DeliveryAgent } from '@/models/DeliveryAgent'
export { default as Category } from '@/models/Category'
export { default as Product } from '@/models/Product'
export { default as Cart } from '@/models/Cart'
export { default as Order } from '@/models/Order'
export { default as Rating } from '@/models/Rating'
