import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// FluentCart Tools - E-commerce Management
// Note: FluentCart API is still in development. These tools are based on common e-commerce patterns
// and will be updated when official API documentation is released.

export const fluentCartTools = [
  // Product Management
  {
    name: 'fcart_list_products',
    description: 'List all products in FluentCart store with filtering options',
    inputSchema: { type: 'object' as const, properties: z.object({
      page: z.number().optional().describe('Page number for pagination'),
      per_page: z.number().optional().describe('Number of products per page (max 100)'),
      search: z.string().optional().describe('Search term for product name/description'),
      status: z.enum(['publish', 'draft', 'pending']).optional().describe('Product status filter'),
      category: z.number().optional().describe('Category ID filter'),
    }).shape },
  },
  {
    name: 'fcart_get_product',
    description: 'Get detailed information about a specific product',
    inputSchema: { type: 'object' as const, properties: z.object({
      product_id: z.number().describe('Product ID'),
    }).shape },
  },
  {
    name: 'fcart_create_product',
    description: 'Create a new product in FluentCart',
    inputSchema: { type: 'object' as const, properties: z.object({
      name: z.string().describe('Product name'),
      description: z.string().optional().describe('Product description'),
      price: z.number().describe('Product price'),
      sale_price: z.number().optional().describe('Sale price'),
      sku: z.string().optional().describe('Product SKU'),
      stock_quantity: z.number().optional().describe('Stock quantity'),
      categories: z.array(z.number()).optional().describe('Category IDs'),
      images: z.array(z.string()).optional().describe('Image URLs'),
      status: z.enum(['publish', 'draft']).optional().describe('Product status'),
    }).shape },
  },
  {
    name: 'fcart_update_product',
    description: 'Update an existing product',
    inputSchema: { type: 'object' as const, properties: z.object({
      product_id: z.number().describe('Product ID'),
      name: z.string().optional().describe('Product name'),
      description: z.string().optional().describe('Product description'),
      price: z.number().optional().describe('Product price'),
      sale_price: z.number().optional().describe('Sale price'),
      sku: z.string().optional().describe('Product SKU'),
      stock_quantity: z.number().optional().describe('Stock quantity'),
      status: z.enum(['publish', 'draft']).optional().describe('Product status'),
    }).shape },
  },
  {
    name: 'fcart_delete_product',
    description: 'Delete a product from FluentCart',
    inputSchema: { type: 'object' as const, properties: z.object({
      product_id: z.number().describe('Product ID'),
      force: z.boolean().optional().describe('Force delete (bypass trash)'),
    }).shape },
  },
  {
    name: 'fcart_update_product_pricing',
    description: 'Update product pricing (price, sale_price, SKU)',
    inputSchema: { type: 'object' as const, properties: z.object({
      product_id: z.number().describe('Product ID'),
      price: z.number().describe('Product price in dollars (will be converted to cents)'),
      sale_price: z.number().optional().describe('Sale price in dollars'),
      sku: z.string().optional().describe('Product SKU'),
    }).shape },
  },
  {
    name: 'fcart_get_product_thumbnail',
    description: 'Get product thumbnail image',
    inputSchema: { type: 'object' as const, properties: z.object({
      variant_id: z.number().describe('Product variant ID'),
    }).shape },
  },
  {
    name: 'fcart_set_product_thumbnail',
    description: 'Set product thumbnail image',
    inputSchema: { type: 'object' as const, properties: z.object({
      variant_id: z.number().describe('Product variant ID'),
      image_id: z.number().describe('WordPress media ID for the thumbnail'),
    }).shape },
  },

  // Order Management
  {
    name: 'fcart_list_orders',
    description: 'List all orders with filtering options',
    inputSchema: { type: 'object' as const, properties: z.object({
      page: z.number().optional().describe('Page number'),
      per_page: z.number().optional().describe('Orders per page (max 100)'),
      status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']).optional().describe('Order status'),
      customer_id: z.number().optional().describe('Filter by customer ID'),
      date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    }).shape },
  },
  {
    name: 'fcart_get_order',
    description: 'Get detailed information about a specific order',
    inputSchema: { type: 'object' as const, properties: z.object({
      order_id: z.number().describe('Order ID'),
    }).shape },
  },
  {
    name: 'fcart_create_order',
    description: 'Create a new order manually',
    inputSchema: { type: 'object' as const, properties: z.object({
      customer_id: z.number().describe('Customer ID'),
      products: z.array(z.object({
        product_id: z.number(),
        quantity: z.number(),
      })).describe('Products in order'),
      status: z.enum(['pending', 'processing', 'completed']).optional().describe('Order status'),
      payment_method: z.string().optional().describe('Payment method'),
    }).shape },
  },
  {
    name: 'fcart_update_order',
    description: 'Update order status or details',
    inputSchema: { type: 'object' as const, properties: z.object({
      order_id: z.number().describe('Order ID'),
      status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']).optional().describe('Order status'),
      notes: z.string().optional().describe('Order notes'),
    }).shape },
  },
  {
    name: 'fcart_mark_order_paid',
    description: 'Mark an order as paid',
    inputSchema: { type: 'object' as const, properties: z.object({
      order_id: z.number().describe('Order ID'),
    }).shape },
  },
  {
    name: 'fcart_refund_order',
    description: 'Refund an order',
    inputSchema: { type: 'object' as const, properties: z.object({
      order_id: z.number().describe('Order ID'),
      amount: z.number().optional().describe('Refund amount (full refund if not specified)'),
      reason: z.string().optional().describe('Refund reason'),
    }).shape },
  },
  {
    name: 'fcart_update_order_statuses',
    description: 'Bulk update order statuses',
    inputSchema: { type: 'object' as const, properties: z.object({
      order_ids: z.array(z.number()).describe('Array of order IDs'),
      status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']).describe('New status'),
    }).shape },
  },
  {
    name: 'fcart_delete_order',
    description: 'Delete an order',
    inputSchema: { type: 'object' as const, properties: z.object({
      order_id: z.number().describe('Order ID'),
    }).shape },
  },

  // Customer Management
  {
    name: 'fcart_list_customers',
    description: 'List all customers in FluentCart',
    inputSchema: { type: 'object' as const, properties: z.object({
      page: z.number().optional().describe('Page number'),
      per_page: z.number().optional().describe('Customers per page'),
      search: z.string().optional().describe('Search by name or email'),
    }).shape },
  },
  {
    name: 'fcart_get_customer',
    description: 'Get customer details including order history',
    inputSchema: { type: 'object' as const, properties: z.object({
      customer_id: z.number().describe('Customer ID'),
    }).shape },
  },
  {
    name: 'fcart_create_customer',
    description: 'Create a new customer',
    inputSchema: { type: 'object' as const, properties: z.object({
      email: z.string().describe('Customer email'),
      first_name: z.string().optional().describe('First name'),
      last_name: z.string().optional().describe('Last name'),
    }).shape },
  },
  {
    name: 'fcart_update_customer',
    description: 'Update customer details',
    inputSchema: { type: 'object' as const, properties: z.object({
      customer_id: z.number().describe('Customer ID'),
      email: z.string().optional().describe('Customer email'),
      first_name: z.string().optional().describe('First name'),
      last_name: z.string().optional().describe('Last name'),
    }).shape },
  },

  // Coupon Management
  {
    name: 'fcart_list_coupons',
    description: 'List all discount coupons',
    inputSchema: { type: 'object' as const, properties: z.object({
      page: z.number().optional().describe('Page number'),
      per_page: z.number().optional().describe('Coupons per page'),
      status: z.enum(['active', 'expired', 'disabled']).optional().describe('Coupon status'),
    }).shape },
  },
  {
    name: 'fcart_create_coupon',
    description: 'Create a new discount coupon',
    inputSchema: { type: 'object' as const, properties: z.object({
      code: z.string().describe('Coupon code'),
      discount_type: z.enum(['percentage', 'fixed']).describe('Discount type'),
      amount: z.number().describe('Discount amount'),
      expiry_date: z.string().optional().describe('Expiry date (YYYY-MM-DD)'),
      usage_limit: z.number().optional().describe('Maximum usage count'),
      minimum_amount: z.number().optional().describe('Minimum order amount'),
    }).shape },
  },
  {
    name: 'fcart_update_coupon',
    description: 'Update coupon details',
    inputSchema: { type: 'object' as const, properties: z.object({
      coupon_id: z.number().describe('Coupon ID'),
      code: z.string().optional().describe('Coupon code'),
      amount: z.number().optional().describe('Discount amount'),
      status: z.enum(['active', 'disabled']).optional().describe('Coupon status'),
    }).shape },
  },
  {
    name: 'fcart_delete_coupon',
    description: 'Delete a coupon',
    inputSchema: { type: 'object' as const, properties: z.object({
      coupon_id: z.number().describe('Coupon ID'),
    }).shape },
  },
  {
    name: 'fcart_get_coupon',
    description: 'Get coupon details',
    inputSchema: { type: 'object' as const, properties: z.object({
      coupon_id: z.number().describe('Coupon ID'),
    }).shape },
  },
  {
    name: 'fcart_apply_coupon',
    description: 'Apply a coupon to a cart or order',
    inputSchema: { type: 'object' as const, properties: z.object({
      coupon_code: z.string().describe('Coupon code'),
      order_id: z.number().optional().describe('Order ID to apply coupon to'),
    }).shape },
  },

  // Subscriptions
  {
    name: 'fcart_list_subscriptions',
    description: 'List all subscriptions',
    inputSchema: { type: 'object' as const, properties: z.object({
      page: z.number().optional().describe('Page number'),
      per_page: z.number().optional().describe('Items per page'),
      status: z.string().optional().describe('Subscription status'),
      customer_id: z.number().optional().describe('Filter by customer ID'),
    }).shape },
  },
  {
    name: 'fcart_get_subscription',
    description: 'Get subscription details',
    inputSchema: { type: 'object' as const, properties: z.object({
      subscription_id: z.number().describe('Subscription ID'),
    }).shape },
  },
  {
    name: 'fcart_cancel_subscription',
    description: 'Cancel a subscription',
    inputSchema: { type: 'object' as const, properties: z.object({
      subscription_id: z.number().describe('Subscription ID'),
    }).shape },
  },
  {
    name: 'fcart_reactivate_subscription',
    description: 'Reactivate a cancelled subscription',
    inputSchema: { type: 'object' as const, properties: z.object({
      subscription_id: z.number().describe('Subscription ID'),
    }).shape },
  },

  // Analytics
  {
    name: 'fcart_get_analytics',
    description: 'Get store analytics and sales data',
    inputSchema: { type: 'object' as const, properties: z.object({
      date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
      metrics: z.array(z.enum(['revenue', 'orders', 'customers', 'products_sold'])).optional().describe('Metrics to retrieve'),
    }).shape },
  },
];

export const fluentCartHandlers = {
  // Product handlers
  fcart_list_products: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.search) params.append('search', args.search);
      if (args.status) params.append('status', args.status);
      if (args.category) params.append('category', args.category);
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/products?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_product: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/products/${args.product_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_create_product: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fluentcart/products', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_update_product: async (args: any) => {
    try {
      const { product_id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fluentcart/products/${product_id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_delete_product: async (args: any) => {
    try {
      const params = args.force ? '?force=true' : '';
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fluentcart/products/${args.product_id}${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_update_product_pricing: async (args: any) => {
    try {
      const { product_id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fluentcart/products/${product_id}/pricing`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_product_thumbnail: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/products/${args.variant_id}/thumbnail`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_set_product_thumbnail: async (args: any) => {
    try {
      const { variant_id, ...data } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fluentcart/products/${variant_id}/thumbnail`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Order handlers
  fcart_list_orders: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.status) params.append('status', args.status);
      if (args.customer_id) params.append('customer_id', args.customer_id);
      if (args.date_from) params.append('date_from', args.date_from);
      if (args.date_to) params.append('date_to', args.date_to);
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/orders?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_order: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/orders/${args.order_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_create_order: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fluentcart/orders', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_update_order: async (args: any) => {
    try {
      const { order_id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fluentcart/orders/${order_id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_mark_order_paid: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fluentcart/orders/${args.order_id}/mark-paid`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_refund_order: async (args: any) => {
    try {
      const { order_id, ...data } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fluentcart/orders/${order_id}/refund`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_update_order_statuses: async (args: any) => {
    try {
      const response = await makeWordPressRequest('PUT', 'fc-manager/v1/fluentcart/orders/update-statuses', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_delete_order: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fluentcart/orders/${args.order_id}/delete`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Customer handlers
  fcart_list_customers: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.search) params.append('search', args.search);
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/customers?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_customer: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/customers/${args.customer_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_create_customer: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fluentcart/customers', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_update_customer: async (args: any) => {
    try {
      const { customer_id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fluentcart/customers/${customer_id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Coupon handlers
  fcart_list_coupons: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.status) params.append('status', args.status);
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/coupons?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_create_coupon: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fluentcart/coupons', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_update_coupon: async (args: any) => {
    try {
      const { coupon_id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fluentcart/coupons/${coupon_id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_delete_coupon: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fluentcart/coupons/${args.coupon_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_coupon: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/coupons/${args.coupon_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_apply_coupon: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fluentcart/coupons/apply', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Subscription handlers
  fcart_list_subscriptions: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.status) params.append('status', args.status);
      if (args.customer_id) params.append('customer_id', args.customer_id);
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/subscriptions?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_subscription: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/subscriptions/${args.subscription_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_cancel_subscription: async (args: any) => {
    try {
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fluentcart/subscriptions/${args.subscription_id}/cancel`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_reactivate_subscription: async (args: any) => {
    try {
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fluentcart/subscriptions/${args.subscription_id}/reactivate`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Analytics handler
  fcart_get_analytics: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.date_from) params.append('date_from', args.date_from);
      if (args.date_to) params.append('date_to', args.date_to);
      if (args.metrics) params.append('metrics', args.metrics.join(','));
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/analytics?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },
};


