export const products: any[] = [];

const categories = [
  "Oversize",
  "Graphic",
  "Accessories",
  "Footwear",
  "Fragrances",
  "Home Decor",
  "Vintage",
  "Logo",
  "Basic"
];

for (let i = 1; i <= 2000; i++) {
  products.push({
    id: i,
    name: `Vantage Product ${i}`,
    price: Math.floor(Math.random() * 1500) + 500,
    discountPrice: Math.random() > 0.7 ? Math.floor(Math.random() * 1000) + 300 : null,
    category: categories[Math.floor(Math.random() * categories.length)],
    image: `https://picsum.photos/seed/vantage${i}/600/800`,
    image2: `https://picsum.photos/seed/vantage${i+1}/600/800`,
    sizes: ["S", "M", "L", "XL"],
    stock: Math.floor(Math.random() * 50) + 5,
    averageRating: Math.random() * 5
  });
}