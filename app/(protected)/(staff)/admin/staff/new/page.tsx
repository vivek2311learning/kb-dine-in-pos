import StaffForm from '@/app/components/ui/staffForm';

export default function NewStaffPage() {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Add Staff Member
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create a new staff account for the restaurant
        </p>
      </div>

      <StaffForm />

    </div>
  );
}