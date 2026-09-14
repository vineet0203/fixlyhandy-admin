import { Construction } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "#EDE9FE" }}
        >
          <Construction size={28} style={{ color: "#7C3AED" }} />
        </div>
        <h1 className="text-xl font-bold text-[#111827]">{title}</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          This section is under development and will be available soon.
        </p>
      </div>
    </div>
  );
}
