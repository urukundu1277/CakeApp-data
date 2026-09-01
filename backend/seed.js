require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Slider = require('./src/models/Slider');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await Slider.deleteMany({});
    console.log('Cleared existing data');

    const birthdayCategory = await Category.create({
      name: 'Birthday',
      description: 'Delicious birthday cakes for all ages',
      image: 'https://picsum.photos/seed/cake-birthday/400/300',
      isActive: true,
      sortOrder: 1,
    });

    const anniversaryCategory = await Category.create({
      name: 'Anniversary',
      description: 'Romantic anniversary cakes for your special day',
      image: 'https://picsum.photos/seed/cake-anniversary/400/300',
      isActive: true,
      sortOrder: 2,
    });

    const partyCategory = await Category.create({
      name: 'Party Cakes',
      description: 'Fun and colorful party cakes for celebrations',
      image: 'https://picsum.photos/seed/cake-party/400/300',
      isActive: true,
      sortOrder: 3,
    });

    console.log('Created fixed categories:', birthdayCategory.name, anniversaryCategory.name, partyCategory.name);

    const products = [
      {
        name: 'Chocolate Delight',
        description: 'Rich and creamy chocolate cake with layers of ganache',
        categories: [birthdayCategory._id],
        images: ['https://picsum.photos/seed/chocolate-cake/600/600'],
        sizes: ['500g', '1kg', '2kg', '3kg'],
        basePrice: 599,
        isAvailable: true,
        featured: true,
        preparationTime: '24 hours',
        rating: 4.5,
        reviewCount: 128,
      },
      {
        name: 'Vanilla Dream',
        description: 'Soft vanilla sponge with vanilla buttercream frosting',
        categories: [birthdayCategory._id],
        images: ['https://picsum.photos/seed/vanilla-cake/600/600'],
        sizes: ['500g', '1kg', '2kg'],
        basePrice: 499,
        isAvailable: true,
        featured: true,
        preparationTime: '24 hours',
        rating: 4.2,
        reviewCount: 86,
      },
      {
        name: 'Strawberry Bliss',
        description: 'Fresh strawberry cake with whipped cream and strawberries',
        categories: [anniversaryCategory._id],
        images: ['https://picsum.photos/seed/strawberry-cake/600/600'],
        sizes: ['1kg', '2kg', '3kg'],
        basePrice: 549,
        isAvailable: true,
        featured: false,
        preparationTime: '24 hours',
        rating: 4.7,
        reviewCount: 64,
      },
      {
        name: 'Black Forest',
        description: 'Classic black forest cake with cherries and cream',
        categories: [partyCategory._id],
        images: ['https://picsum.photos/seed/blackforest-cake/600/600'],
        sizes: ['1kg', '2kg', '3kg'],
        basePrice: 649,
        isAvailable: true,
        featured: true,
        preparationTime: '24 hours',
        rating: 4.4,
        reviewCount: 95,
      },
      {
        name: 'Red Velvet',
        description: 'Smooth red velvet cake with cream cheese frosting',
        categories: [birthdayCategory._id],
        images: ['https://picsum.photos/seed/redvelvet-cake/600/600'],
        sizes: ['500g', '1kg', '2kg'],
        basePrice: 699,
        isAvailable: true,
        featured: false,
        preparationTime: '24 hours',
        rating: 4.8,
        reviewCount: 152,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    console.log('\nProduct IDs for testing:');
    createdProducts.forEach((p) => {
      console.log(`  ${p.name}: ${p._id}`);
    });

    const sliders = [
      {
        title: 'Fresh Cakes Daily',
        description: 'Order now and get same-day delivery',
        image: 'https://picsum.photos/seed/slider-cake1/800/400',
        link: '',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'Custom Birthday Cakes',
        description: 'Personalized designs for your special day',
        image: 'https://picsum.photos/seed/slider-cake2/800/400',
        link: '',
        sortOrder: 2,
        isActive: true,
      },
      {
        title: 'Premium Anniversary Collection',
        description: 'Elegant cakes for unforgettable moments',
        image: 'https://picsum.photos/seed/slider-cake3/800/400',
        link: '',
        sortOrder: 3,
        isActive: true,
      },
    ];

    const createdSliders = await Slider.insertMany(sliders);
    console.log(`Created ${createdSliders.length} sliders`);

    await mongoose.connection.close();
    console.log('\nSeeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
