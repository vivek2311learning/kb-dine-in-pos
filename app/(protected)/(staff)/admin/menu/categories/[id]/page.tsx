import mongoose from 'mongoose';

import CategoryForm from '@/app/components/ui/CategoryForm';
import { connectDB } from '@/app/lib/db';
import MenuCategory from '@/app/lib/models/menuCategory';

export default async function EditMenuCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectDB();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return <div className="p-6">Invalid category id</div>;
  }

  const category = await MenuCategory.findById(id).lean();

  if (!category) {
    return <div className="p-6">Category not found</div>;
  }

  const safeCategory = {
    _id: category._id.toString(),
    name: category.name || '',
    isActive: !!category.isActive,
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Category</h1>
        <p className="text-sm text-gray-500 mt-1">Update menu category</p>
      </div>

      <CategoryForm initialData={safeCategory} isEdit />
    </div>
  );
}
