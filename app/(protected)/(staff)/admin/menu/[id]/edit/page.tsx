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

  return <MenuForm initialData={safeItem} isEdit />;
}
