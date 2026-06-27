export interface Service {
  id: string | number;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  vendor?: {
    name: string;
    avatar?: string;
    initials?: string;
    avatarColor?: string;
    verified: boolean;
  } | null;
  finance?: { amount: string; label: string } | null;
  category: string;
  sub_category_id?: number | null;
  sub_category?: string | null;
  location?: string | null;
  detailedAddress?: string | null;
  detailed_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price?: string | null;
  status: "Published" | "Pending" | "Draft";
  featured: boolean;
  sort_order?: number;
  dateAdded?: string;
  created_at?: string;
  updated_at?: string;
}

export const servicesData: Service[] = [
  {
    id: "#1256",
    title: "Plumbing Services",
    subtitle: "Expert plumbing solutions",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
    vendor: { name: "Ali Plumbing", avatar: "https://i.pravatar.cc/64?img=12", verified: true },
    finance: { amount: "USD 45,320", label: "Earnings" },
    category: "Home Services",
    location: "Lahore, Pakistan",
    price: "USD 1,500+",
    status: "Published",
    featured: true,
    dateAdded: "2024-05-15T10:30:00",
  },
  {
    id: "#1255",
    title: "Cleaning Services",
    subtitle: "Professional cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&h=80&fit=crop",
    vendor: { name: "CleanPro", initials: "C", avatarColor: "#7C3AED", verified: true },
    finance: { amount: "USD 32,150", label: "Earnings" },
    category: "Home Services",
    location: "Karachi, Pakistan",
    price: "USD 2,000+",
    status: "Published",
    featured: true,
    dateAdded: "2024-05-14T14:15:00",
  },
  {
    id: "#1254",
    title: "AC Repair & Maintenance",
    subtitle: "Cool your life",
    image: "https://images.unsplash.com/photo-1631083366506-a0ae8f58bfdb?w=80&h=80&fit=crop",
    vendor: { name: "Cooling Experts", initials: "AC", avatarColor: "#6B7280", verified: true },
    finance: { amount: "USD 28,900", label: "Earnings" },
    category: "Repair Services",
    location: "Islamabad, Pakistan",
    price: "USD 2,500+",
    status: "Pending",
    featured: false,
    dateAdded: "2024-05-14T11:45:00",
  },
  {
    id: "#1253",
    title: "Car Washing",
    subtitle: "Premium car wash",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=80&h=80&fit=crop",
    vendor: { name: "Wash Zone", initials: "WASH", avatarColor: "#1F2937", verified: true },
    finance: { amount: "USD 19,870", label: "Earnings" },
    category: "Automotive",
    location: "Lahore, Pakistan",
    price: "USD 800+",
    status: "Published",
    featured: true,
    dateAdded: "2024-05-13T09:20:00",
  },
  {
    id: "#1252",
    title: "Electrical Services",
    subtitle: "Safe & reliable work",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=80&h=80&fit=crop",
    vendor: { name: "Power Solutions", avatar: "https://i.pravatar.cc/64?img=15", verified: true },
    finance: { amount: "USD 27,650", label: "Earnings" },
    category: "Home Services",
    location: "Rawalpindi, Pakistan",
    price: "USD 1,800+",
    status: "Draft",
    featured: false,
    dateAdded: "2024-05-12T16:10:00",
  },
  {
    id: "#1251",
    title: "Painting Services",
    subtitle: "Give a new look",
    image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=80&h=80&fit=crop",
    vendor: { name: "Paint Pro", initials: "PAINT", avatarColor: "#7C3AED", verified: true },
    finance: { amount: "USD 21,420", label: "Earnings" },
    category: "Home Services",
    location: "Multan, Pakistan",
    price: "USD 2,200+",
    status: "Published",
    featured: true,
    dateAdded: "2024-05-11T13:05:00",
  },
  {
    id: "#1250",
    title: "Moving Services",
    subtitle: "Safe & fast moving",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=80&h=80&fit=crop",
    vendor: { name: "Move It", initials: "MOVE", avatarColor: "#1F2937", verified: true },
    finance: { amount: "USD 38,760", label: "Earnings" },
    category: "Other Services",
    location: "Karachi, Pakistan",
    price: "USD 3,000+",
    status: "Pending",
    featured: false,
    dateAdded: "2024-05-10T10:00:00",
  },
];
