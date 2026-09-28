import MediaEdukasiForm from "@/components/media-edukasi/MediaEdukasiForm";

export default function TambahMediaEdukasiPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <MediaEdukasiForm mode="create" />
    </div>
  );
}
