import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await db.orm.public.Category.where({}).all();
    return NextResponse.json({
      categories: categories
        .sort((a, b) => a.position - b.position)
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
          position: c.position,
        })),
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug: customSlug, description, imageUrl } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    let baseSlug = (customSlug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      baseSlug = `cat-${Date.now().toString(36)}`;
    }

    // Check if slug exists, if so generate a unique slug
    let finalSlug = baseSlug;
    const existing = await db.orm.public.Category.where({ slug: finalSlug }).all();
    if (existing.length > 0) {
      finalSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    // Get current category count for position
    const allCategories = await db.orm.public.Category.where({}).all();
    const position = allCategories.length;

    const id = generateId();
    await db.orm.public.Category.create({
      id,
      name: cleanName,
      slug: finalSlug,
      description: description || null,
      imageUrl: imageUrl || null,
      position,
    });

    try {
      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/collections');
      revalidatePath('/');
    } catch (e) {
      // ignore
    }

    return NextResponse.json(
      {
        success: true,
        category: {
          id,
          name: cleanName,
          slug: finalSlug,
          description: description || null,
          imageUrl: imageUrl || null,
          position,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message || 'Creation failed' }, { status: 500 });
  }
}
