import SupervisiForm from "@/components/supervisi/SupervisiForm";

export default function TambahSupervisiPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <SupervisiForm mode="create" />
    </div>
  );
}
