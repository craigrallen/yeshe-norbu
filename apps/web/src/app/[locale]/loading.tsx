export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-[72px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#E8B817] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Laddar... / Loading...</p>
      </div>
    </div>
  );
}
