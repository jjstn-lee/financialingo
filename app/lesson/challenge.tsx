import { cn } from "@/lib/utils";

import { Card } from "./card";

type ChallengeProps = {
  options: string[];
  onSelect: (choice: string) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: string;
  disabled?: boolean;
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
}: ChallengeProps) => {
  return (
    <div className={cn("grid grid-cols-1 gap-2 lg:grid-cols-2")}>
      {options.map((option, i) => (
        <Card
          key={`${option}-${i}`}
          text={option}
          shortcut={`${i + 1}`}
          selected={selectedOption === option}
          onClick={() => onSelect(option)}
          status={status}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
