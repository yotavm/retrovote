import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

type RouterboardQuery = {
  boardId: string;
};

const Board: NextPage = () => {
  const router = useRouter();
  const { boardId } = router.query as RouterboardQuery;
  const { data: board, isLoading } = api.board.getById.useQuery({ boardId });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex items-center justify-center">
        {isLoading && <div>Loading...</div>}
        {board && <div>{board.name}</div>}
        {!board && !isLoading && <div>Not Found</div>}
      </div>
    </main>
  );
};

export default Board;
