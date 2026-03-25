import mongoose from 'mongoose';
import { connectDB } from '@/app/lib/db';
import MenuCategory from '@/app/lib/models/menuCategory';
import CategoryForm from '@/app/components/ui/CategoryForm';
import { Card } from '@/app/components/ui/card';

export default async function EditMenuCategoryPage({ params }: any) {
  await connectDB();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return <div className="p-6 text-center text-red-600">Invalid ID</div>;
  }

  const category = await MenuCategory.findById(id).lean();

  if (!category) {
    return <div className="p-6 text-center">Not found</div>;
  }

  const safe = {
    _id: category._id.toString(),
    name: category.name,
    isActive: category.isActive,
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Category</h1>
        </div>

        <Card
          variant="ghost"
          className="p-5 border  border-[#3b2a1a]/15 bg-transparent"
        >
          <CategoryForm initialData={safe} isEdit />
        </Card>
      </div>
    </div>
  );
}
