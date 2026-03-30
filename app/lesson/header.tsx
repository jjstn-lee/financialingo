import { X } from "lucide-react";

import { Progress } from "@/components/ui/progress";

type HeaderProps = {
  percentage: number;
};

export const Header = ({ percentage }: HeaderProps) => {
  return (
    <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10 py-[20px] lg:py-[50px]">      <X
      onClick={() => window.history.back()}
      className="cursor-pointer text-slate-500 transition hover:opacity-75"
    />

      <Progress value={percentage} />

      <div className="w-6" />
    </header>
  );
};
