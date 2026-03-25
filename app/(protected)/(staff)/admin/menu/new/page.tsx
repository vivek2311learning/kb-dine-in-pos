import MenuForm from '@/app/components/ui/MenuForm';
import { Card } from '@/app/components/ui/card';

export default function AddMenuPage() {
  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Add Menu Item</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new item for the restaurant menu
          </p>
        </div>

        {/* FORM CARD */}
        <Card
          variant="ghost"
          hover={false}
          className="p-5 md:p-6 border border-[#3b2a1a]/15 bg-transparent shadow-none"
        >
          <MenuForm />
        </Card>
      </div>
    </div>
  );
}
