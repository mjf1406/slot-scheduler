import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import type { Class, SlotClass } from "~/server/db/types";
import { formatDate, sanitizeHtml } from "~/lib/utils";
import parse, { type DOMNode, Text } from "html-react-parser";

interface DisplayClassDetailsProps {
  classItem: SlotClass | null;
  classDetails: Class | null;
  isOpen: boolean;
  onClose: () => void;
}

const HashtagBadge: React.FC<{ tag: string }> = ({ tag }) => (
  <Badge
    variant="secondary"
    className="inline-flex items-center bg-blue-100 text-blue-800"
  >
    #{tag}
  </Badge>
);

const DisplayClassDetails: React.FC<DisplayClassDetailsProps> = ({
  classItem,
  classDetails,
  isOpen,
  onClose,
}) => {
  if (!classDetails) return null;

  const sizeClasses = {
    container: "p-1",
    icon: "h-12 w-12 pr-2",
    text: "text-sm",
    button: "p-1",
  };

  const formattedDate = formatDate(new Date());

  const contentStyle = `
    .class-content h2 {
      font-size: 1.5em;
      font-weight: bold;
      margin-top: 0.75rem;
      margin-bottom: 0.2rem;
    }
    .class-content ol {
      list-style-type: decimal;
      margin-left: 1.5em;
    }
    .class-content ul {
      list-style-type: disc;
      margin-left: 1.5em;
    }
    .class-content li {
      display: list-item;
    }
  `;

  const sanitized = sanitizeHtml(classItem?.text ?? "");

  const options = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Text) {
        const textContent = domNode.data;
        const hashtagRegex = /#(\w+)/g;

        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = hashtagRegex.exec(textContent)) !== null) {
          if (match.index > lastIndex) {
            parts.push(textContent.substring(lastIndex, match.index));
          }
          parts.push(<HashtagBadge key={match.index} tag={match[1] ?? ""} />);
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < textContent.length) {
          parts.push(textContent.substring(lastIndex));
        }

        return <>{parts}</>;
      }
      return undefined;
    },
  };

  const processedText = parse(sanitized, options);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-screen max-w-full p-0 text-2xl [&>button]:hidden">
        <style>{contentStyle}</style>
        <div className="flex h-full flex-col">
          <div
            className="flex items-center justify-between p-6 text-primary-foreground"
            style={{ backgroundColor: classDetails.color }}
          >
            <h2 className="flex items-center text-4xl font-bold">
              <FontAwesomeIcon
                icon={[
                  classDetails.icon_prefix as IconPrefix,
                  classDetails.icon_name as IconName,
                ]}
                className={`mr-3 text-4xl ${sizeClasses.icon}`}
              />
              <div className="flex flex-col">
                <div>{classDetails.name}</div>
                <div className="text-2xl">{formattedDate}</div>
              </div>
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-8 w-8" />
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <div className="p-6">
              <div className="class-content">{processedText}</div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplayClassDetails;
