import Link from "next/link";

export const TopBar = () => {
  return (
    <div className="w-full border-b border-b-slate-700 bg-slate-900">
      <div className="flex h-16 items-center p-6">
        <div className="text-xl font-extrabold tracking-tight text-white">
          <Link href={"/"}>
            Retro<span className="text-[#0098eb]">Vote</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
