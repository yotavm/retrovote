import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/Popover";
import { Switch } from "~/components/Switch";
import { TopBar } from "~/components/TopBar";
import { type RouterOutputs, api } from "~/utils/api";
import { getAnyanomesId } from "~/utils/cookies";

type RouterboardQuery = {
  boardId: string;
};
type Ideas = RouterOutputs["board"]["getById"]["ideas"];
type Vote = RouterOutputs["board"]["getById"]["ideas"][0]["vote"];
type IdeasProps = {
  boardId: string;
  boardCreatorId: string;
  ideas: Ideas;
  openForVoting: boolean;
  voteLimit: number;
  sort: boolean;
};

const VoteCount = ({
  votes,
  creatorId,
  ideaId,
  handleRemoveVote,
}: {
  votes: Vote;
  creatorId: string;
  ideaId: string;
  handleRemoveVote: (ideaId: string) => void;
}) => {
  const yourVotes = votes.filter((vote) => vote.creatorId === creatorId);
  const otherVotes = votes.filter((vote) => vote.creatorId !== creatorId);

  return (
    <div className="absolute right-0 bottom-0 z-10 row-auto flex">
      {yourVotes.length > 0 && (
        <div
          className="m-2 flex w-10 items-center justify-center rounded-xl bg-slate-700 p-1 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveVote(ideaId);
          }}
        >
          <p>{yourVotes.length}</p>
          <p>❤️</p>
        </div>
      )}
      {otherVotes.length > 0 && (
        <div className="m-2 flex w-10 items-center justify-center rounded-xl bg-slate-700 p-1 text-sm">
          <p>{otherVotes.length}</p>
          <p>☝️</p>
        </div>
      )}
    </div>
  );
};

const Ideas = (Props: IdeasProps) => {
  const { boardId, ideas, openForVoting, sort, boardCreatorId } = Props;
  const ctx = api.useContext();
  const { user } = useUser();
  const currentUserId = user?.id || getAnyanomesId();
  const [newIdea, setNewIdea] = useState("");

  const sortIdeas = useMemo(() => {
    if (sort) {
      return ideas.sort((a, b) => {
        return b.vote.length - a.vote.length;
      });
    }
    return ideas;
  }, [ideas, sort]);

  const { mutate: createIdea } = api.idea.create.useMutation({
    onMutate: async ({ boardId, content }) => {
      await ctx.board.getById.cancel({ boardId });
      const previousBoard = ctx.board.getById.getData({ boardId });

      if (previousBoard) {
        ctx.board.getById.setData(
          { boardId },
          {
            ...previousBoard,
            ideas: [
              ...previousBoard.ideas,
              {
                content,
                boardId,
                id: "temp-id",
                creatorId: "temp-id",
                vote: [],
              },
            ],
          }
        );
      }

      return { previousBoard };
    },
    onError: (err, { boardId }, context) => {
      if (context?.previousBoard) {
        ctx.board.getById.setData({ boardId }, context.previousBoard);
      }
      toast.error("This didn't work.");
      console.log(err);
    },
    onSuccess: () => {
      void ctx.board.getById.invalidate();
      setNewIdea("");
    },
  });

  const { mutate: addVote } = api.idea.addVote.useMutation({
    onSuccess: () => {
      void ctx.board.getById.invalidate();
    },
    onError: (err) => {
      toast.error("This didn't work.");
      console.log(err);
    },
  });

  const { mutate: removeVote } = api.idea.removeVote.useMutation({
    onSuccess: () => {
      void ctx.board.getById.invalidate();
    },
    onError: (err) => {
      toast.error("This didn't work.");
      console.log(err);
    },
  });

  const { mutate: deleteIdea } = api.idea.delete.useMutation({
    onSuccess: () => {
      void ctx.board.getById.invalidate();
    },
    onError: (err) => {
      toast.error("This didn't work.");
      console.log(err);
    },
  });

  const handleVoting = (ideaId: string) => {
    if (openForVoting) {
      addVote({ boardId, ideaId });
    }
  };

  const handleRemoveVote = (ideaId: string) => {
    const idea = ideas.find((idea) => idea.id === ideaId);
    const vote = idea?.vote.find((vote) => vote.creatorId === currentUserId);
    if (vote) {
      removeVote({ ideaId, voteId: vote.id });
    }
  };

  const handleAddVote = () => {
    if (newIdea !== "") {
      createIdea({ boardId, content: newIdea });
    }
  };

  return (
    <>
      <div className="container mt-16 flex h-full flex-col items-center justify-center">
        <div className="scroll-m-20 text-4xl font-semibold tracking-tight lg:text-4xl">
          {!openForVoting && "Add Ideas. Then Vote"}
          {openForVoting && "Vote for your favorite ideas"}
        </div>

        <div
          className={`relative my-16 flex w-full items-center ${
            openForVoting ? "invisible" : "visible"
          }`}
        >
          <input
            className="h-[48px] w-full rounded-sm border-b-2 border-slate-500 bg-slate-800 p-2  pr-16 outline-none focus:ring-2 focus:ring-[#0098eb] focus:ring-offset-2 focus:ring-offset-slate-900"
            type="text"
            placeholder="Type your idea here..."
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddVote();
              }
            }}
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="absolute right-0 mx-2 h-6 w-6 cursor-pointer"
            onClick={() => {
              handleAddVote();
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </div>
      </div>

      <div className="text-slate-00 grid w-full cursor-pointer grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 p-4 text-slate-100">
        {sortIdeas.map((idea, i) => {
          return (
            <div
              key={i}
              className="group relative h-[230px] rounded-md border-2 border-white  border-opacity-60 bg-[linear-gradient(110.1deg,_rgba(46,_29,_99,_0.4)_0%,_#3D0F34_100%)] p-4"
              onClick={() => handleVoting(idea.id)}
            >
              <p>{idea.content}</p>
              <VoteCount
                votes={idea.vote}
                creatorId={currentUserId}
                handleRemoveVote={handleRemoveVote}
                ideaId={idea.id}
              />
              <div
                className={`${
                  idea.creatorId === currentUserId ||
                  boardCreatorId === currentUserId
                    ? "group-hover:flex"
                    : ""
                } absolute top-[-9px] right-[-10px] hidden h-7 w-7 items-center justify-center rounded-full border-2 border-white border-opacity-60 bg-slate-900 text-slate-100`}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteIdea({ ideaId: idea.id });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    stroke-lineap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const BoardSetting = ({
  boardId,
  openForVoting,
  showIdeas,
  voteLimit,
  privateVoteing,
  sort,
  setSort,
}: {
  boardId: string;
  openForVoting: boolean;
  showIdeas: boolean;
  voteLimit: number;
  privateVoteing: boolean;
  sort: boolean;
  setSort: (sort: boolean) => void;
}) => {
  const ctx = api.useContext();
  const { mutate: updateBoard } = api.board.update.useMutation({
    onError: (err) => {
      toast.error("This didn't work.");
      console.log(err);
    },
    onSuccess: () => {
      toast.success("Board Setting updated!");
      void ctx.board.getById.invalidate();
    },
  });

  const saveBoardSettings = (
    name: "showIdeas" | "voteLimit" | "openForVoting" | "privateVoteing",
    value: boolean | number
  ) => {
    updateBoard({
      boardId,
      settingName: name,
      value,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Set the Board Settings.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 items-center gap-4">
              <label htmlFor="Sort">Sort</label>
              <button onClick={() => setSort(true)}>Sort</button>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label htmlFor="Open Voting">Open Voting</label>
              <Switch
                onCheckedChange={(e) => {
                  saveBoardSettings("openForVoting", e);
                }}
                defaultChecked={openForVoting}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label htmlFor="Private Voteing">Private Voteing</label>
              <Switch
                onCheckedChange={(e) => {
                  saveBoardSettings("privateVoteing", e);
                }}
                defaultChecked={privateVoteing}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label htmlFor="Show Ideas">Show Ideas</label>
              <Switch
                onCheckedChange={(e) => {
                  saveBoardSettings("showIdeas", e);
                }}
                defaultChecked={showIdeas}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label htmlFor="votes">Votes</label>
              <input
                name="votes"
                defaultValue={voteLimit}
                type="number"
                max={10}
                onChange={(e) => {
                  saveBoardSettings("voteLimit", parseInt(e.target.value));
                }}
                className="no-spinner h-8 w-6 rounded-sm  border-b-2  border-slate-500 bg-transparent bg-slate-800 text-center outline-none focus:ring-2 focus:ring-[#0098eb] focus:ring-offset-2 focus:ring-offset-slate-900"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Board: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { boardId } = router.query as RouterboardQuery;
  const { data: board, isLoading } = api.board.getById.useQuery(
    { boardId },
    {
      refetchInterval: 10000,
    }
  );
  const [sort, setSort] = useState(false);
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
            {user?.id === board.creatorId && (
              <BoardSetting
                boardId={boardId}
                openForVoting={board.openForVoting}
                showIdeas={board.showIdeas}
                voteLimit={board.voteLimit}
                privateVoteing={board.privateVoteing}
                sort={sort}
                setSort={setSort}
              />
            )}
          </div>
        </div>

        <div className="h-min-30 w-full bg-slate-800">
          <div className="container my-6">
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
              <div>{board.name}</div>
            </h3>
            <p className="mt-2 w-1/2 break-normal leading-6">
              {board.description}
            </p>
          </div>
        </div>
        <Ideas
          boardId={boardId}
          ideas={board.ideas}
          openForVoting={board.openForVoting}
          voteLimit={board.voteLimit}
          sort={sort}
          boardCreatorId={board.creatorId}
        />
      </main>
    </div>
  );
};

export default Board;
