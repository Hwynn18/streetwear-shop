'use client';

import { useState } from 'react';

export default function FaqAccordion({ faqs }) {
  const [openId, setOpenId] = useState(null);

  if (!faqs || faqs.length === 0) {
    return <p className="text-stone-400">등록된 FAQ가 없습니다.</p>;
  }

  return (
    <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full flex justify-between items-center py-4 text-left text-stone-800 font-medium"
            >
              <span>Q. {faq.question}</span>
              <span className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-40 pb-4' : 'max-h-0'
              }`}
            >
              <p className="text-stone-500 text-sm">A. {faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
