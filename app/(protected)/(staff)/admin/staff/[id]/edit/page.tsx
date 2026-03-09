import StaffForm from '@/app/components/ui/staffForm';
import { connectDB } from '@/app/lib/db';
import User from '@/app/lib/models/User';

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectDB();

  const { id } = await params;

  const user = await User.findById(id).select('-password').lean();

  const safeUser = {
    ...user,
    _id: user?._id.toString(),
  };

  return <StaffForm initialData={safeUser} isEdit />;
}
