export const category = [
  { img: "/images/shoes.jpg", name: "Shoes", slug: "shoes", off: "Premium Campaign" },
  { img: "/images/cap.jpg", name: "Caps", slug: "caps", off: "Custom Branding" },
  { img: "/images/hoodies.jpg", name: "Hoodies", slug: "hoodies", off: "Limited Edition" },
  { img: "/images/tshirts.jpg", name: "T-Shirts", slug: "tshirts", off: "Best Sellers" },
  { img: "/images/jackets.jpg", name: "Jackets", slug: "jackets", off: "Executive Wear" },
  { img: "/images/kits.jpg", name: "Supporter Kits", slug: "kits", off: "Value Packs" },
  { img: "/images/halfcoat.jpeg", name: "Reflectors", slug: "reflectors", off: "Bulk Discount" },
  { img: "/images/flag.jpg", name: "Flags", slug: "flags", off: "Event Ready" },
];

export const filter = [
  {
    name: "Product Categories",
    value: "category",
    items: [
      "Shoes", "Caps", "Hoodies", "T-Shirts", "Jackets",
      "Supporter Kits", "Reflectors", "Flags",
    ],
  },
  {
    name: "Filter by Price",
    value: "price",
    items: [],
  },
  {
    name: "Filter by Size",
    value: "size",
    items: ["S", "M", "L", "XL", "XXL"],
  },
];

export const SEGMENTS = [
  { id: "presidential", label: "Presidential Taste", minPrice: 8000 },
  { id: "governor", label: "Governor Taste", minPrice: 5000 },
  { id: "senator", label: "Senator Taste", minPrice: 3500 },
  { id: "mp", label: "MP Taste", minPrice: 2500 },
  { id: "mca", label: "MCA Taste", minPrice: 1500 },
  { id: "supporter", label: "Supporter Taste", maxPrice: 2000 },
];
