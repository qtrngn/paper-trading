// get all the Orders 
/* 
use type Order
Used shared api client
Call endpoint api/orders
Expect backend to return object with "orders"
return [orders]
*/

// Submit order

/* 
- accept SubmitOrderRequest type
- send to api/orders/submit
- use POST request
- receive backend response
- return the response status"
*/


import { api } from "@/lib/api";
import type { Order, OrderSide, OrderType } from "./types";



type GetOrdersResponse = {
    orders: Order[];
}

type SubmitOrderResponse = {
    order: Order;
}

type SubmitOrderRequest = {
    symbol: string;
    side: OrderSide;
    qty: number;
    type: OrderType;
    limitPrice: number | null;
}


// GET ORDERS 
export async function getOrders(): Promise<Order[]>  {
    const response = await api.get<GetOrdersResponse>("/api/orders/orders");
    
    return response.data.orders; 
}

// SUBMIT ORDER REQUEST
export async function submitOrder(orderInput: SubmitOrderRequest): Promise<Order> {
    // submit orderInput to backend, expect backend to return SubmitOrderResponse and store the backend response data
    const response = await api.post<SubmitOrderResponse>("/api/orders/submit", orderInput);
    return response.data.order;
}


