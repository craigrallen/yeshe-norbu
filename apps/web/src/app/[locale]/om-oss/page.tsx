export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="pt-[72px]">
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-6">{sv ? 'Om oss' : 'About Us'}</h1>
        <div className="gold-bar mb-8" />
        <div className="prose prose-lg text-charcoal-light leading-relaxed whitespace-pre-line">
          {sv ? `Yeshin Norbu Meditationscenter är en ideell medlemsorganisation som är starkt inspirerad av Dalai Lamas vision om sekulär och universell etik. Centret startades 2017 av en handfull entusiastiska volontärer som tillsammans hjälpte till att bygga upp centret till vad det är idag.

Vi erbjuder olika klasser som främjar mentalt och fysiskt välbefinnande som meditation och mindfulness, yoga och autentisk buddhistisk filosofi.

Yeshin Norbu Meditationscenter är anslutet till Foundation for Preservation of the Mahayana Tradition (FPMT), som är en världsomfattande ideell organisation med 165 centra och projekt i 40 länder.` : `Yeshin Norbu Meditation Centre is a non-profit membership organisation strongly inspired by the Dalai Lama's vision of secular and universal ethics. The centre was founded in 2017 by a handful of enthusiastic volunteers who helped build the centre into what it is today.

We offer various classes promoting mental and physical well-being such as meditation and mindfulness, yoga and authentic Buddhist philosophy.

Yeshin Norbu is affiliated with the Foundation for Preservation of the Mahayana Tradition (FPMT), a worldwide non-profit with 165 centres and projects in 40 countries.`}
        </div>
      </section>
    </div>
  );
}
