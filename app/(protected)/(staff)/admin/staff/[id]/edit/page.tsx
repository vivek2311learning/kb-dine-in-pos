import StaffForm from '@/app/components/ui/staffForm';
import { connectDB } from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { notFound } from 'next/navigation';

export default async function EditPage({
  params,
}: {
  params: { id: string };
}) {
  await connectDB();

  const { id } = params;

  const user = await User.findById(id)
    .select('-password')
    .lean();

  /* ❌ user not found */
  if (!user) {
    return notFound();
  }

  /* ✅ safe object */
  const safeUser = {
    ...user,
    _id: user._id.toString(),
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Edit Staff Member
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Edit staff account for the restaurant
        </p>
      </div>

      <StaffForm initialData={safeUser} isEdit />
    </div>
  );
}