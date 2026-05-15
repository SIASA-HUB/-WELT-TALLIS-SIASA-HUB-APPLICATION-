/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('products').del();
  
  await knex('products').insert([
    {
      name: 'Kenyan Flag T-Shirt',
      title: 'Premium Cotton Kenyan Flag T-Shirt',
      description: 'High-quality 100% cotton T-shirt featuring the Kenyan flag. Perfect for campaign events and national pride.',
      price: 1500.00,
      mrp: 2000.00,
      category: 'T-Shirts',
      stock: 100,
      seller: 'SiasaHub Store',
      featured: true,
      image: '/uploads/products/tshirt-kenya.webp',
      slug: 'kenyan-flag-t-shirt',
      status: 'active'
    },
    {
      name: 'VOTE 2027 Cap',
      title: 'Embroidered VOTE 2027 Baseball Cap',
      description: 'Stylish and durable embroidered cap for the 2027 elections. One size fits all with adjustable strap.',
      price: 800.00,
      mrp: 1200.00,
      category: 'Hats',
      stock: 250,
      seller: 'SiasaHub Store',
      featured: true,
      image: '/uploads/products/cap-vote.webp',
      slug: 'vote-2027-cap',
      status: 'active'
    },
    {
      name: 'Campaign Hoodie',
      title: 'Warm Campaign Season Hoodie',
      description: 'Stay warm during night rallies with this premium fleece hoodie. Available in various colors.',
      price: 2500.00,
      mrp: 3500.00,
      category: 'Hoodies',
      stock: 50,
      seller: 'SiasaHub Store',
      featured: false,
      image: '/uploads/products/hoodie-campaign.webp',
      slug: 'campaign-hoodie',
      status: 'active'
    },
    {
      name: 'Aspirant Poster (A1)',
      title: 'A1 High-Gloss Campaign Poster',
      description: 'Large format A1 posters with UV protection. Vibrant colors and sharp text to make your message stand out.',
      price: 200.00,
      mrp: 300.00,
      category: 'Posters',
      stock: 1000,
      seller: 'SiasaHub Store',
      featured: true,
      image: '/uploads/products/poster-a1.webp',
      slug: 'aspirant-poster-a1',
      status: 'active'
    },
    {
      name: 'BBI Branded Scarf',
      title: 'National Unity Branded Scarf',
      description: 'Elegant branded scarf for formal campaign events. High-quality silk-feel material.',
      price: 1200.00,
      mrp: 1800.00,
      category: 'Accessories',
      stock: 75,
      seller: 'SiasaHub Store',
      featured: false,
      image: '/uploads/products/scarf-bbi.webp',
      slug: 'bbi-branded-scarf',
      status: 'active'
    }
  ]);
};
