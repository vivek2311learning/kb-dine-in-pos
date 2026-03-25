import StaffForm from '@/app/components/ui/staffForm';

export default function NewStaffPage() {
  return (
    <div className="border border-[#3b2a1a]/15 rounded-xl px-4 py-6 md:px-6 md:py-8 max-w-3xl mx-auto space-y-6">
      <div className="border border-[#3b2a1a]/15 rounded-xl px-4 py-6 flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold">Add Staff Member</h1>

        <p className="text-sm text-gray-500 mt-1">Create a new staff account</p>
      </div>

      <StaffForm />
    </div>
  );
}
