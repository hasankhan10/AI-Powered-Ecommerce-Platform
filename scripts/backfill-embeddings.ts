import { db } from '../lib/prisma';
import { generateEmbedding } from '../lib/ai/embeddings';

async function backfillEmbeddings() {
  console.log('Starting product embeddings backfill...');

  try {
    const [products, categories] = await Promise.all([
      db.orm.public.Product.where({}).all(),
      db.orm.public.Category.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    console.log(`Found ${products.length} products to index.`);

    let count = 0;
    for (const product of products) {
      const categoryName = categoryMap.get(product.categoryId) || 'General';
      const textToEmbed = `${product.name}. Category: ${categoryName}. ${product.description || ''}`;

      const vector = await generateEmbedding(textToEmbed);
      console.log(`[${++count}/${products.length}] Generated embedding for: "${product.name}" (${vector.length} dims)`);
    }

    console.log('Embeddings backfill completed successfully.');
  } catch (err) {
    console.error('Backfill error:', err);
  }
}

backfillEmbeddings();
