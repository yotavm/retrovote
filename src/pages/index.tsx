import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <>
      <Head>
        <title>RetroVote</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Retro<span className="text-[#0098eb]">Vote</span>
          </h1>
          {!isLoaded && <p>Loading...</p>}
          {!isSignedIn && <SignInButton />}
          {isSignedIn && <BoardCreation />}
        </div>
      </main>
    </>
  );
};

const BoardCreation = () => {
  const router = useRouter();
  const [boardName, setboardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  const { mutate, isLoading } = api.board.create.useMutation({
    onSuccess: async ({ boardId }) => {
      setboardName("");
      await router.push(`board/${boardId}`);
    },
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <input
        className="h-[48px] w-full rounded-sm border-b-2 border-slate-500 bg-slate-800 p-2  pr-16 outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        type="text"
        placeholder="board Name"
        value={boardName}
        onChange={(e) => setboardName(e.target.value)}
      />
      <textarea
        value={boardDescription}
        onChange={(e) => {
          setBoardDescription(e.target.value);
        }}
        placeholder="board Description"
        className="h-[100px] w-full rounded-sm border-b-2 border-slate-500 bg-slate-800 p-2  pr-16 outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      />
      <button
        onClick={() => {
          mutate({ name: boardName, description: boardDescription });
        }}
      >
        Create
      </button>
    </div>
  );
};

export default Home;
