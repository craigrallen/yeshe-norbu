export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-[#58595b] dark:bg-[#2A2A2A] text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        {subtitle ? <p className="text-lg text-gray-300 max-w-2xl mx-auto">{subtitle}</p> : null}
      </div>
    </div>
  );
}
