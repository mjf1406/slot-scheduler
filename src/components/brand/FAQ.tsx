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
      question: "What does is Slotted?",
      answer:
        "It's a webapp that I designed to make it easier to sort out each of my weeks as a teacher. I set up a default timetable with default classes that I can quickly change the length of, then move them around the week.",
    },
    {
      question: "How do I get started?",
      answer: "To get started, just click Sign in in the top-right corner!",
    },
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
