import { listFaqs } from '@/lib/store';
import ScrollReveal from '@/components/ScrollReveal';
import FaqAccordion from './FaqAccordion';

function getFaqs() {
  try {
    return listFaqs();
  } catch (err) {
    console.error('[FAQ GET ERROR]', err);
    return [];
  }
}

export default function FaqPage() {
  const faqs = getFaqs();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <ScrollReveal>
        <h1 className="text-2xl font-bold text-stone-900 mb-8">자주 묻는 질문</h1>
      </ScrollReveal>
      <ScrollReveal>
        <FaqAccordion faqs={faqs} />
      </ScrollReveal>
    </div>
  );
}
