import MenuForm from '@/app/components/ui/MenuForm';

export default function AddMenuPage() {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Add Menu Item</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new item for the restaurant menu
        </p>
      </div>

      <MenuForm />
    </div>
  );
}
