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
    <div className="flex w-full gap-4">
      <input
        className="flex-1 rounded-md border-2 bg-transparent px-2 py-2 text-white outline-none"
        type="text"
        placeholder="board Name"
        value={boardName}
        onChange={(e) => setboardName(e.target.value)}
      />
      <button
        onClick={() => {
          mutate({ name: boardName });
        }}
      >
        Create
      </button>
    </div>
  );
};

export default Home;
