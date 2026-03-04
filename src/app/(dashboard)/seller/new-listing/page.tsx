import { ListingForm } from "@/components/listings/ListingForm";

export default function NewListingPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Pre-Market Profile</h1>
      <p className="mb-8 text-sm text-gray-500">
        Share your intent to sell. You control what information is visible to potential buyers.
        This is not a formal listing — it&apos;s a planning tool.
      </p>
      <ListingForm mode="create" />
    </div>
  );
}
