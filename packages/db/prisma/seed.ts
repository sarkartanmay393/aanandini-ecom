import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // ── 1. Admin user ───────────────────────────────────────

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@aanandini.com' },
        update: {},
        create: {
            name: 'Aanandini Admin',
            email: 'admin@aanandini.com',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });
    console.log(`👤 Admin: ${admin.email} (password: admin123)`);

    // ── 2. Customer users ───────────────────────────────────

    const customerPassword = await bcrypt.hash('customer123', 10);
    const customers = await Promise.all(
        [
            { name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543210' },
            { name: 'Anita Devi', email: 'anita@example.com', phone: '9876543211' },
            { name: 'Rekha Patel', email: 'rekha@example.com', phone: '9876543212' },
        ].map((c) =>
            prisma.user.upsert({
                where: { email: c.email },
                update: {},
                create: { ...c, password: customerPassword, role: Role.CUSTOMER },
            }),
        ),
    );
    console.log(`👥 ${customers.length} customers created (password: customer123)\n`);

    // ── 2b. Addresses ───────────────────────────────────────

    const addressData = [
        {
            userId: customers[0].id,
            label: 'Home',
            street: '42, MG Road, Koramangala',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560034',
            phone: '9876543210',
            isDefault: true,
        },
        {
            userId: customers[0].id,
            label: 'Office',
            street: '101, Brigade Gateway, Rajajinagar',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560010',
            phone: '9876543210',
            isDefault: false,
        },
        {
            userId: customers[1].id,
            label: 'Home',
            street: '15, Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700016',
            phone: '9876543211',
            isDefault: true,
        },
        {
            userId: customers[2].id,
            label: 'Home',
            street: '8, CG Road, Navrangpura',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380009',
            phone: '9876543212',
            isDefault: true,
        },
    ];

    let addressCount = 0;
    for (const addr of addressData) {
        const existing = await prisma.address.findFirst({
            where: { userId: addr.userId, label: addr.label },
        });
        if (!existing) {
            await prisma.address.create({ data: addr });
            addressCount++;
        }
    }
    console.log(`📍 ${addressCount} addresses created\n`);

    // ── 3. Categories ───────────────────────────────────────

    const categoryData = [
        { name: 'Banarasi Saree', slug: 'banarasi-saree' },
        { name: 'Kanjivaram Saree', slug: 'kanjivaram-saree' },
        { name: 'Chanderi Saree', slug: 'chanderi-saree' },
        { name: 'Tussar Silk Saree', slug: 'tussar-silk-saree' },
        { name: 'Cotton Handloom', slug: 'cotton-handloom' },
        { name: 'Linen Saree', slug: 'linen-saree' },
    ];

    const categories: Record<string, string> = {};
    for (const cat of categoryData) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
        categories[cat.slug] = created.id;
    }
    console.log(`📂 ${categoryData.length} categories created\n`);

    // ── 4. Products (with reliable image URLs) ──────────────

    const products = [
        // Banarasi
        {
            name: 'Royal Banarasi Silk Saree — Ruby Red',
            description:
                'Handwoven pure Banarasi silk saree in deep ruby red with intricate zari work featuring traditional mughal motifs. The pallu showcases an elaborate kalga-bel pattern woven with real gold zari. Comes with an unstitched blouse piece.',
            price: 12500,
            stock: 8,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['banarasi-saree'],
        },
        {
            name: 'Banarasi Organza Saree — Emerald Green',
            description:
                'Lightweight Banarasi organza saree in emerald green with delicate floral jaal weave. Perfect for summer weddings and festive occasions. The sheer texture gives a contemporary twist to traditional Banarasi craftsmanship.',
            price: 8900,
            stock: 12,
            images: [
                'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['banarasi-saree'],
        },
        {
            name: 'Banarasi Brocade Saree — Midnight Blue',
            description:
                'Opulent Banarasi brocade saree in midnight blue with silver zari jaal work. Handwoven by master weavers of Varanasi over 15 days. Features traditional bootis and a rich pallu with peacock motifs.',
            price: 15800,
            stock: 5,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['banarasi-saree'],
        },

        // Kanjivaram
        {
            name: 'Kanjivaram Pure Silk — Temple Border Magenta',
            description:
                'Authentic Kanjivaram silk saree handwoven in Kanchipuram. Rich magenta body with contrasting gold temple border and traditional peacock motifs on the pallu. GI-tagged, comes with a silk mark certificate.',
            price: 18500,
            stock: 6,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['kanjivaram-saree'],
        },
        {
            name: 'Kanjivaram Silk — Peacock Teal & Gold',
            description:
                'Stunning Kanjivaram silk saree in peacock teal with rich gold butta work all over. Traditional korvai technique used to join contrasting border. Handwoven with premium mulberry silk yarn.',
            price: 22000,
            stock: 4,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop',
            ],
            categoryId: categories['kanjivaram-saree'],
        },

        // Chanderi
        {
            name: 'Chanderi Silk Cotton — Lavender Dreams',
            description:
                'Elegant Chanderi silk-cotton blend saree in soft lavender with zari bootis and a tissue border. Lightweight and airy, ideal for day functions and office wear. Handwoven by artisans of Chanderi, Madhya Pradesh.',
            price: 4500,
            stock: 15,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['chanderi-saree'],
        },
        {
            name: 'Chanderi Pure Silk — Ivory & Gold',
            description:
                'Classic Chanderi pure silk saree in ivory with gold zari stripes and traditional bootis. The sheer texture and lightweight drape make it a timeless addition to every wardrobe. GI-tagged product.',
            price: 6200,
            stock: 10,
            images: [
                'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['chanderi-saree'],
        },

        // Tussar Silk
        {
            name: 'Tussar Silk Saree — Natural Beige with Madhubani',
            description:
                'Hand-painted Madhubani art on natural tussar silk saree. Each piece is unique — featuring fish, peacock, and floral motifs painted by women artisans of Madhubani, Bihar. A wearable canvas of folk art.',
            price: 7800,
            stock: 7,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['tussar-silk-saree'],
        },
        {
            name: 'Ghicha Tussar Silk — Rust Orange',
            description:
                'Textured ghicha tussar silk saree in warm rust orange with a natural slubby finish. Block-printed with traditional Bagru motifs using vegetable dyes. Each saree supports rural artisan communities in Jharkhand.',
            price: 5500,
            stock: 9,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['tussar-silk-saree'],
        },

        // Cotton Handloom
        {
            name: 'Bengal Handloom Cotton — Indigo Jamdani',
            description:
                'Traditional Bengal jamdani handloom cotton saree in indigo blue with white floral motifs woven on the loom. Breathable and comfortable, perfect for everyday elegance. Woven by master weavers of Nadia district.',
            price: 3200,
            stock: 20,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop',
            ],
            categoryId: categories['cotton-handloom'],
        },
        {
            name: 'Khadi Cotton Saree — Off-White with Red Border',
            description:
                'Handspun khadi cotton saree in off-white with a bold red border and pallu. Each saree takes 3 days to weave on a traditional pit loom. A tribute to India\'s freedom movement and sustainable fashion.',
            price: 2800,
            stock: 18,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['cotton-handloom'],
        },
        {
            name: 'Pochampalli Ikat Cotton — Teal & Coral',
            description:
                'Double-ikat handloom cotton saree from Pochampalli, Telangana. Geometric patterns in teal and coral created using the resist-dyeing technique before weaving. GI-tagged authentic product.',
            price: 3800,
            stock: 14,
            images: [
                'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['cotton-handloom'],
        },

        // Linen
        {
            name: 'Handloom Linen Saree — Sage Green',
            description:
                'Soft handloom linen saree in sage green with silver zari border. Lightweight, breathable, and perfect for summer. Pre-washed for a soft drape. Woven in the handloom clusters of Bhagalpur, Bihar.',
            price: 3500,
            stock: 16,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['linen-saree'],
        },
        {
            name: 'Pure Linen Saree — Mustard Yellow',
            description:
                'Vibrant mustard yellow pure linen saree with contrast navy blue pallu and tassels. Hand-dyed using natural dyes. Extremely comfortable and eco-friendly — perfect for the conscious shopper.',
            price: 4200,
            stock: 11,
            images: [
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop',
            ],
            categoryId: categories['linen-saree'],
        },
    ];

    let productCount = 0;
    const createdProducts: any[] = [];
    for (const p of products) {
        const existing = await prisma.product.findFirst({ where: { name: p.name } });
        if (!existing) {
            const created = await prisma.product.create({ data: p });
            createdProducts.push(created);
            productCount++;
        } else {
            // Update images on existing products  
            await prisma.product.update({
                where: { id: existing.id },
                data: { images: p.images },
            });
            createdProducts.push(existing);
        }
    }
    console.log(`🛍️  ${productCount} products created (images updated on existing)\n`);

    // ── 5. Sample orders ────────────────────────────────────

    const existingOrders = await prisma.order.count();
    if (existingOrders === 0) {
        const addresses = await prisma.address.findMany();
        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];
            const customerAddr = addresses.find((a) => a.userId === customer.id);
            const orderProducts = createdProducts
                .sort(() => Math.random() - 0.5)
                .slice(0, 2 + Math.floor(Math.random() * 2));

            const items = orderProducts.map((p) => ({
                productId: p.id,
                quantity: 1 + Math.floor(Math.random() * 2),
                price: p.price,
            }));

            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const statuses = ['PENDING', 'SHIPPED', 'DELIVERED'] as const;
            const paymentStatuses = ['SUCCESS', 'SUCCESS', 'SUCCESS'] as const;

            await prisma.order.create({
                data: {
                    userId: customer.id,
                    status: statuses[i % 3],
                    paymentStatus: paymentStatuses[i % 3],
                    total,
                    shippingAddressId: customerAddr?.id,
                    items: { create: items },
                },
            });
        }
        console.log(`📦 ${customers.length} sample orders created\n`);
    } else {
        console.log(`📦 Orders already exist, skipping\n`);
    }

    // ── 6. Sample reviews ───────────────────────────────────

    const reviewComments = [
        { rating: 5, comment: 'Absolutely beautiful! The zari work is exquisite and the color is even more vibrant in person. Worth every rupee.' },
        { rating: 4, comment: 'Lovely saree with great drape. The handloom quality is evident. Slightly different shade than the photo but still gorgeous.' },
        { rating: 5, comment: 'Received so many compliments at a wedding! The weave quality is top-notch. Will definitely buy more from Aanandini.' },
        { rating: 4, comment: 'Beautiful craftsmanship. The packaging was also premium. Delivery took a bit longer but the product was worth the wait.' },
        { rating: 5, comment: 'This is exactly what I was looking for — authentic handloom with a contemporary touch. Supporting artisans feels great!' },
        { rating: 3, comment: 'Good quality saree but the blouse piece is a bit short. Overall happy with the purchase though.' },
    ];

    let reviewCount = 0;
    for (let i = 0; i < 6; i++) {
        const customer = customers[i % customers.length];
        const product = createdProducts[i % createdProducts.length];
        const review = reviewComments[i];

        const existing = await prisma.review.findFirst({
            where: { userId: customer.id, productId: product.id },
        });
        if (!existing) {
            await prisma.review.create({
                data: {
                    userId: customer.id,
                    productId: product.id,
                    rating: review.rating,
                    comment: review.comment,
                },
            });
            reviewCount++;
        }
    }
    console.log(`⭐ ${reviewCount} reviews created\n`);

    // ── 7. Sample wishlist ──────────────────────────────────

    let wishlistCount = 0;
    for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        const wishProducts = createdProducts
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);

        for (const p of wishProducts) {
            const existing = await prisma.wishlist.findUnique({
                where: { userId_productId: { userId: customer.id, productId: p.id } },
            });
            if (!existing) {
                await prisma.wishlist.create({
                    data: { userId: customer.id, productId: p.id },
                });
                wishlistCount++;
            }
        }
    }
    console.log(`💝 ${wishlistCount} wishlist items created\n`);

    console.log('✅ Seed complete!');
    console.log('────────────────────────────────────');
    console.log('  Admin login:    admin@aanandini.com / admin123');
    console.log('  Customer login: priya@example.com / customer123');
    console.log('────────────────────────────────────\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
