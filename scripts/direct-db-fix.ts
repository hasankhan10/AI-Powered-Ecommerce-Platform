import pg from 'pg';

async function directDbFix() {
  console.log('--- Executing Direct Postgres Fix via pg Pool ---');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  // 1. Update Apparel Category Image
  const apparelResult = await pool.query(`
    UPDATE "Category"
    SET "imageUrl" = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
    WHERE "slug" = 'apparel'
  `);
  console.log(`✓ Updated Category apparel (rows affected: ${apparelResult.rowCount})`);

  // 2. Delete ALL bad/broken/duplicate ProductImage rows
  const deleteResult = await pool.query(`
    DELETE FROM "ProductImage"
    WHERE "url" LIKE '%1594938298603-c8148c4b85c4%'
       OR "url" LIKE '%1551489186-ccb8d3d16cb5%'
       OR "url" LIKE '%1603252109360-909baaf261ae%'
  `);
  console.log(`✓ Deleted ${deleteResult.rowCount} broken image rows from ProductImage.`);

  // 3. Clear all ProductImage rows completely and recreate clean 2 images per product
  await pool.query(`DELETE FROM "ProductImage"`);
  console.log(`✓ Cleared ProductImage table for fresh clean insert.`);

  const PRODUCT_IMAGE_MAP: Record<string, string[]> = {
    'linen-cocoon-shirt': [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'
    ],
    'silk-slip-dress': [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
    ],
    'wide-leg-linen-trouser': [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
    ],
    'khadi-blazer': [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'
    ],
    'cotton-linen-wrap-top': [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
    ],
    'structured-tote': [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80'
    ],
    'woven-raffia-clutch': [
      'https://images.unsplash.com/photo-1591561954555-607968c989ab?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'
    ],
    'silk-scarf': [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'
    ],
    'leather-belt': [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1591561954555-607968c989ab?w=800&q=80'
    ],
    'ceramic-mug-set': [
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
    ],
    'block-printed-table-runner': [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1603825491103-bd638b1873b0?w=800&q=80'
    ],
    'brass-taper-candle-holder': [
      'https://images.unsplash.com/photo-1603825491103-bd638b1873b0?w=800&q=80',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80'
    ]
  };

  const { rows: products } = await pool.query(`SELECT "id", "slug", "name" FROM "Product"`);
  for (const p of products) {
    const images = PRODUCT_IMAGE_MAP[p.slug] || [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
    ];

    for (let i = 0; i < images.length; i++) {
      const imgId = 'img_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      await pool.query(
        `INSERT INTO "ProductImage" ("id", "productId", "url", "altText", "position") VALUES ($1, $2, $3, $4, $5)`,
        [imgId, p.id, images[i], `${p.name} Image ${i + 1}`, i]
      );
    }
    console.log(`✓ Inserted 2 clean images for ${p.name} (${p.slug})`);
  }

  // Final check
  const { rows: finalCats } = await pool.query(`SELECT "name", "imageUrl" FROM "Category"`);
  console.log('=== FINAL CATEGORIES ===');
  finalCats.forEach(c => console.log(c.name, '->', c.imageUrl));

  const { rows: finalImgs } = await pool.query(`
    SELECT p."name", pi."url", pi."position"
    FROM "Product" p
    JOIN "ProductImage" pi ON p."id" = pi."productId"
    WHERE pi."position" = 0
    ORDER BY p."name"
  `);
  console.log('=== PRIMARY PRODUCT IMAGES (POSITION 0) ===');
  finalImgs.forEach(i => console.log(i.name, '->', i.url));

  await pool.end();
  console.log('--- DIRECT FIX COMPLETE ---');
}

directDbFix()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error during direct DB fix:', err);
    process.exit(1);
  });
