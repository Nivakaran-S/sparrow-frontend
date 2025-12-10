/**
 * Shared TypeScript types for the Sparrow frontend application
 */

// User roles
export type UserRole = 'Admin' | 'Customer' | 'Driver' | 'Staff';

// Base user interface
export interface BaseUser {
    id: string;
    role: UserRole;
}

// Extended user with profile details
export interface User extends BaseUser {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    gender?: string;
}

// Admin-specific user type
export interface AdminUser extends User {
    role: 'Admin';
}

// Customer-specific user type
export interface CustomerUser extends User {
    role: 'Customer';
}

// Driver-specific user type
export interface DriverUser extends User {
    role: 'Driver';
    vehicleType?: string;
    licenseNumber?: string;
}

// Staff-specific user type
export interface StaffUser extends User {
    role: 'Staff';
    department?: string;
}

// Parcel interfaces
export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface Parcel {
    id: string;
    trackingNumber: string;
    status: ParcelStatus;
    senderAddress: Address;
    receiverAddress: Address;
    weight: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    createdAt: string;
    updatedAt: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
}

export type ParcelStatus =
    | 'pending'
    | 'picked_up'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned';

// Order interfaces
export interface Order {
    id: string;
    customerId: string;
    parcelId: string;
    status: OrderStatus;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    createdAt: string;
    updatedAt: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded';

// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Auth check response
export interface AuthCheckResponse {
    id: string;
    role: UserRole;
}

// Component prop types
export interface DashboardPageProps {
    setActiveTab: (tab: string) => void;
}

export interface NavigationProps {
    user: User | null;
    setActiveTab: (tab: string) => void;
}

export interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}
