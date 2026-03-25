import mongoose from 'mongoose';

import MenuForm from '@/app/components/ui/MenuForm';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';
import { Card } from '@/app/components/ui/card';

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectDB();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return (
      <div className="p-6 text-center text-red-600">Invalid menu item id</div>
    );
  }

  const item = await MenuItem.findById(id).lean();

  if (!item) {
    return <div className="p-6 text-center text-red-600">Item not found</div>;
  }

  const safeItem = {
    _id: item._id.toString(),
    name: item.name || '',
    description: item.description || '',
    price: item.price || 0,
    category: item.category || '',
  };

  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Menu Item</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update details of this menu item
          </p>
        </div>

        {/* FORM CARD */}
        <Card
          variant="ghost"
          hover={false}
          className="p-5 md:p-6 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <MenuForm initialData={safeItem} isEdit />
        </Card>
      </div>
    </div>
  );
}
