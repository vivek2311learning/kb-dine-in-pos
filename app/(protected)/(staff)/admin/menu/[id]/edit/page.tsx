import MenuForm from '@/app/components/ui/MenuForm';
import { connectDB } from '@/app/lib/db';
import MenuItem from '@/app/lib/models/MenuItem';

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectDB();

  const { id } = await params;

  const item = await MenuItem.findById(id).lean();

  if (!item) {
    return <div className="p-6">Item not found</div>;
  }

  // ✅ Convert to plain serializable object
  const safeItem = {
    ...item,
    _id: item._id.toString(),
    createdAt: (item as any).createdAt?.toISOString(),
    updatedAt: (item as any).updatedAt?.toISOString(),
  };
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Menu Item</h1>

        <p className="text-sm text-gray-500 mt-1">
          Edit item for the restaurant menu
        </p>
      </div>

      <MenuForm initialData={safeItem} isEdit />
    </div>
  );
}
