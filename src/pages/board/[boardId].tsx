import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

type RouterboardQuery = {
  boardId: string;
};

const TopBar = () => {
  return (
    <div className="w-full border-b border-b-slate-700 bg-slate-900">
      <div className="flex h-16 items-center p-6">
        <div className="text-xl font-extrabold tracking-tight text-white">
          Retro<span className="text-[#0098eb]">Vote</span>
        </div>
      </div>
    </div>
  );
};

const Board: NextPage = () => {
  const router = useRouter();
  const { boardId } = router.query as RouterboardQuery;
  const { data: board, isLoading } = api.board.getById.useQuery({ boardId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div>
      <TopBar />
      <main className="flex min-h-screen flex-col">
        <div className="h-10 w-full bg-slate-700">
          <div className="container flex h-full flex-row items-center justify-between">
            <div className="text-sm text-slate-400">Members</div>
            <div className="cursor-pointer text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="h-min-30 w-full bg-slate-800">
          <div className="container my-6">
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {board && <div>{board.name}</div>}
            </h3>
            <p className="mt-2 leading-6">
              Once upon a time, in a far-off land, there was a very lazy king
              who spent all day lounging on his throne. One day, his advisors
              came to him with a problem: the kingdom was running out of money.
            </p>
          </div>
        </div>

        <div className="container mt-16 flex h-full flex-col items-center justify-center">
          <div className="scroll-m-20 text-4xl font-semibold tracking-tight lg:text-4xl">
            Add Ideas. Then Vote
          </div>
          <input className="my-16" type="text" />
        </div>
      </main>
    </div>
  );
};

export default Board;
