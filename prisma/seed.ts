/**
 * Maison Vale — Database Seed Script (Prisma v8)
 *
 * Uses @prisma/orm-postgres runtime.
 * Run with: node --env-file=.env.local prisma/seed.mjs
 * Or:        npx tsx prisma/seed.ts (after contract.json is emitted)
 *
 * This is a re-runnable script — it deletes existing seed data first.
 */

// Unsplash image URLs — replace with real product photography later
const IMAGES = {
  apparel: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    "https://images.unsplash.com/photo-1591561954555-607968c989ab?w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  ],
  home: [
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    "https://images.unsplash.com/photo-1603825491103-bd638b1873b0?w=800&q=80",
  ],
};

function generateCuid() {
  return (
    "c" +
    Math.random().toString(36).slice(2, 11) +
    Date.now().toString(36)
  );
}

async function main() {
  // Dynamic import after env vars are loaded
  const { db } = await import("../src/prisma/db.js");

  console.log("🌱 Starting Maison Vale seed...");



  // ── Categories ─────────────────────────────────────────────────────────────
  async function getOrCreateCategory(
    name: string,
    slug: string,
    description: string,
    imageUrl: string,
    position: number
  ) {
    const existing = await db.orm.public.Category.where({ slug }).all();
    if (existing.length > 0) {
      await db.raw.sql`
        UPDATE "Category" 
        SET "imageUrl" = ${imageUrl}, "name" = ${name}, "description" = ${description}, "position" = ${position}
        WHERE "id" = ${existing[0].id}
      `;
      return existing[0];
    }
    return await db.orm.public.Category.create({
      id: generateCuid(),
      name,
      slug,
      description,
      imageUrl,
      position,
    });
  }

  const apparelCat = await getOrCreateCategory(
    "Apparel",
    "apparel",
    "Considered clothing in natural fibres — linen, cotton, and silk from Indian ateliers.",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    1
  );

  const accessoriesCat = await getOrCreateCategory(
    "Accessories",
    "accessories",
    "Handcrafted bags, belts, and adornments made to last beyond seasons.",
    IMAGES.accessories[0],
    2
  );

  const homeCat = await getOrCreateCategory(
    "Home & Living",
    "home-living",
    "Objects for the considered home — ceramics, textiles, and crafted tableware.",
    IMAGES.home[0],
    3
  );

  console.log("✓ Categories verified and updated");

  // ── Helper ─────────────────────────────────────────────────────────────────
  async function upsertProduct(data: {
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    categoryId: string;
    images: string[];
    variants: { size?: string; color?: string; price: number; stock: number }[];
  }) {
    const existing = await db.orm.public.Product.where({ slug: data.slug }).all();
    let productId = '';

    if (existing.length > 0) {
      productId = existing[0].id;
      await db.raw.sql`
        UPDATE "Product"
        SET "name" = ${data.name}, "description" = ${data.description}, "basePrice" = ${data.basePrice.toString()}, "categoryId" = ${data.categoryId}, "status" = 'ACTIVE'
        WHERE "id" = ${productId}
      `;
      await db.raw.sql`DELETE FROM "ProductImage" WHERE "productId" = ${productId}`;
    } else {
      productId = generateCuid();
      await db.orm.public.Product.create({
        id: productId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice.toString(),
        categoryId: data.categoryId,
        status: "ACTIVE",
        metaTitle: `${data.name} — Maison Vale`,
        metaDescription: data.description.slice(0, 155),
      });
    }

    // Fresh Images
    for (let i = 0; i < data.images.length; i++) {
      await db.orm.public.ProductImage.create({
        id: generateCuid(),
        productId,
        url: data.images[i],
        altText: `${data.name} — Image ${i + 1}`,
        position: i,
      });
    }

    // Variants (if creating new)
    if (existing.length === 0) {
      for (const v of data.variants) {
        const variantId = generateCuid();
        const slug = data.slug.toUpperCase().replace(/-/g, "");
        const size = (v.size ?? "OS").replace(/[\s\/]/g, "");
        const color = (v.color ?? "NAT").replace(/\s/g, "").toUpperCase().slice(0, 4);
        const sku = `MV-${slug.slice(0, 8)}-${size.slice(0, 4)}-${color}`;

        await db.orm.public.ProductVariant.create({
          id: variantId,
          productId,
          sku,
          size: v.size ?? null,
          color: v.color ?? null,
          price: v.price.toString(),
          stock: v.stock,
        });

        await db.orm.public.InventoryLog.create({
          id: generateCuid(),
          variantId,
          changeQty: v.stock,
          reason: "RESTOCK",
        });
      }
    }

    return productId;
  }

  // ── APPAREL (5 products) ───────────────────────────────────────────────────
  await upsertProduct({
    name: "Linen Cocoon Shirt",
    slug: "linen-cocoon-shirt",
    description: "A relaxed, cocoon-shaped shirt cut from handwoven Pondicherry linen. The fabric softens beautifully with each wash, developing a lived-in character that synthetic blends can never replicate.",
    basePrice: 4800,
    categoryId: apparelCat.id,
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"
    ],
    variants: [
      { size: "XS/S", color: "Natural", price: 4800, stock: 12 },
      { size: "M/L", color: "Natural", price: 4800, stock: 18 },
      { size: "XL/XXL", color: "Natural", price: 4800, stock: 8 },
      { size: "XS/S", color: "Smoke", price: 4800, stock: 6 },
      { size: "M/L", color: "Smoke", price: 4800, stock: 10 }
    ]
  });

  await upsertProduct({
    name: "Silk Slip Dress",
    slug: "silk-slip-dress",
    description: "Cut from Bangalore mulberry silk, this slip dress moves like water. A cowl neckline at the front and an open drape at the back make it effortlessly versatile.",
    basePrice: 9200,
    categoryId: apparelCat.id,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    ],
    variants: [
      { size: "XS", color: "Ivory", price: 9200, stock: 5 },
      { size: "S", color: "Ivory", price: 9200, stock: 9 },
      { size: "M", color: "Ivory", price: 9200, stock: 11 },
      { size: "L", color: "Ivory", price: 9200, stock: 7 }
    ]
  });

  await upsertProduct({
    name: "Wide-Leg Linen Trouser",
    slug: "wide-leg-linen-trouser",
    description: "A wide, floor-grazing trouser in a medium-weight Coimbatore linen. The high waist and generous leg create clean, architectural lines.",
    basePrice: 5600,
    categoryId: apparelCat.id,
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
    ],
    variants: [
      { size: "XS", color: "Ecru", price: 5600, stock: 14 },
      { size: "S", color: "Ecru", price: 5600, stock: 20 },
      { size: "M", color: "Ecru", price: 5600, stock: 16 }
    ]
  });

  await upsertProduct({
    name: "Khadi Blazer",
    slug: "khadi-blazer",
    description: "A single-button blazer in handspun khadi from the Deccan Handloom Cooperative. Fully lined in breathable cotton voile with two inside pockets.",
    basePrice: 12500,
    categoryId: apparelCat.id,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80"
    ],
    variants: [
      { size: "XS", color: "Oatmeal", price: 12500, stock: 4 },
      { size: "S", color: "Oatmeal", price: 12500, stock: 7 },
      { size: "M", color: "Oatmeal", price: 12500, stock: 9 }
    ]
  });

  await upsertProduct({
    name: "Cotton-Linen Wrap Top",
    slug: "cotton-linen-wrap-top",
    description: "A wrap top in a cotton-linen blend that sits at the natural waist with a self-tie. The V-neckline is deep but not dramatic.",
    basePrice: 3400,
    categoryId: apparelCat.id,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
    ],
    variants: [
      { size: "XS/S", color: "Butter", price: 3400, stock: 15 },
      { size: "M/L", color: "Butter", price: 3400, stock: 20 }
    ]
  });

  console.log("✓ Created 5 apparel products");

  // ── ACCESSORIES (4 products) ───────────────────────────────────────────────
  await upsertProduct({ name: "Structured Tote", slug: "structured-tote", description: "A minimal structured tote crafted in the Dharavi leather district from vegetable-tanned hide. Brass fittings, a flat cotton lining, one inner zip pocket.", basePrice: 18500, categoryId: accessoriesCat.id, images: [IMAGES.accessories[0], IMAGES.accessories[1]], variants: [{ color: "Cognac", price: 18500, stock: 8 }, { color: "Midnight", price: 18500, stock: 6 }, { color: "Bone", price: 18500, stock: 4 }] });
  await upsertProduct({ name: "Woven Raffia Clutch", slug: "woven-raffia-clutch", description: "Handwoven in Manipur from naturally dried raffia palm. A brass magnetic closure and a fine cotton lining with a small mirror pocket.", basePrice: 4200, categoryId: accessoriesCat.id, images: [IMAGES.accessories[2], IMAGES.accessories[3]], variants: [{ color: "Natural", price: 4200, stock: 18 }, { color: "Ecru & Black", price: 4200, stock: 12 }] });
  await upsertProduct({ name: "Hand-Rolled Silk Scarf", slug: "silk-scarf", description: "A 90 × 90 cm square of Varanasi mulberry silk, hand-rolled at the edges the traditional way. Wears as a neck scarf, a head wrap, or knotted around a bag handle.", basePrice: 6800, categoryId: accessoriesCat.id, images: [IMAGES.accessories[1], IMAGES.accessories[0]], variants: [{ color: "Ivory & Brass", price: 6800, stock: 10 }, { color: "Wine & Gold", price: 6800, stock: 7 }, { color: "Indigo & White", price: 6800, stock: 9 }] });
  await upsertProduct({ name: "Leather Belt", slug: "leather-belt", description: "A clean, single-strap belt in vegetable-tanned leather. The buckle is cast brass, lightly polished. Hand-cut and edge-burnished in Chennai.", basePrice: 3200, categoryId: accessoriesCat.id, images: [IMAGES.accessories[3], IMAGES.accessories[2]], variants: [{ size: "S (65–75cm)", color: "Cognac", price: 3200, stock: 12 }, { size: "M (75–85cm)", color: "Cognac", price: 3200, stock: 16 }, { size: "L (85–95cm)", color: "Cognac", price: 3200, stock: 8 }] });

  console.log("✓ Created 4 accessories products");

  // ── HOME & LIVING (3 products) ─────────────────────────────────────────────
  await upsertProduct({ name: "Handthrown Ceramic Mug Set (Set of 2)", slug: "ceramic-mug-set", description: "Two mugs handthrown in a Jaipur pottery studio from buff stoneware clay, fired at high temperature for durability. Dishwasher-safe. Holds 280ml.", basePrice: 2800, categoryId: homeCat.id, images: [IMAGES.home[0], IMAGES.home[1]], variants: [{ color: "Sand & White", price: 2800, stock: 20 }, { color: "Slate & Cream", price: 2800, stock: 15 }, { color: "Terracotta & Bone", price: 2800, stock: 12 }] });
  await upsertProduct({ name: "Block-Printed Linen Table Runner", slug: "block-printed-table-runner", description: "A 45 × 200cm table runner in undyed linen, block-printed in Jaipur with a repeating motif from architectural details of the Nilambur forest lodge.", basePrice: 3600, categoryId: homeCat.id, images: [IMAGES.home[1], IMAGES.home[2]], variants: [{ color: "Indigo on Natural", price: 3600, stock: 25 }, { color: "Rust on Natural", price: 3600, stock: 18 }] });
  await upsertProduct({ name: "Brass Taper Candle Holder Pair", slug: "brass-taper-candle-holder", description: "Two tapered candle holders hand-cast in solid Moradabad brass. They will oxidise slowly and unevenly — a beauty that begins the day you use them.", basePrice: 4400, categoryId: homeCat.id, images: [IMAGES.home[2], IMAGES.home[0]], variants: [{ color: "Brushed Brass", price: 4400, stock: 30 }] });

  console.log("✓ Created 3 home & living products");

  const products = await db.orm.public.Product.where({ status: "ACTIVE" }).all();
  const variants = await db.orm.public.ProductVariant.where({}).all();
  console.log(`\n✅ Seed complete! ${products.length} products, ${variants.length} variants across 3 categories.\n`);

  await db.close();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
