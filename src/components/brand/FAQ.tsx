import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

type FAQ = {
  question: string;
  answer: string;
};

const FrequentlyAskedQuestions: React.FC = () => {
  const faqs: FAQ[] = [
    {
      question: "What is an 11-11 workout?",
      answer:
        "An 11-11 workout is comprised of 4 exercises: (1) upper body push, (2) upper body pull, (3) lower body, and (4) abs.",
    },
    { question: "How do I get started?", answer: "To get started, you can..." },
  ];

  return (
    <div className="container flex h-dvh max-w-4xl flex-col items-center justify-center gap-12 px-4 py-16">
      <h2 id="faq" className="scroll-m-20 text-4xl">
        FAQ
      </h2>
      <Accordion type="single" collapsible className="min-w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FrequentlyAskedQuestions;
